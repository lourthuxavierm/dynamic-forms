import { ConditionController } from '../conditions';
import { DataSourceManager } from '../datasource';
import { describeValueType, type ConditionEvaluationCause, type FieldConditionState } from '../conditions';
import { DependencyController, type DependencyRefreshCause } from '../dependencies';
import { buildFieldStateExplanation } from '../diagnostics/explain';
import { DiagnosticsRecorder } from '../diagnostics/recorder';
import type { DiagnosticCause, ExplainFieldStateOptions, FieldStateExplanation, RuntimeDiagnostics } from '../diagnostics';
import { CorePluginHost, type CorePluginContext } from '../plugins';
import { compileSchemaOrThrow, explainField, mergeSchemaInitialValues, type CompiledFieldExplanation, type CompiledFormSchema, type FormSchema, type InferFormValues, type NormalizedFormSchema } from '../schema';
import {
  dynamicPath,
  FormStore,
  isSamePath,
  type DynamicFormValues,
  type FormSubmitHandler,
  type FormValidator,
  type FormValues,
  type Path,
  type PathValue,
  type ResetOptions,
  type SetValueOptions,
  type ValidateOptions,
} from '../store';
import type {
  FormRuntimeOptions,
  RuntimeLifecycleEvent,
  RuntimeLifecycleListener,
} from './types';

export class FormRuntime<TValues extends FormValues = DynamicFormValues> {
  readonly schema: NormalizedFormSchema;
  readonly compiledSchema: CompiledFormSchema;
  readonly store: FormStore<TValues>;
  readonly dataSources: DataSourceManager;
  readonly dependencies: DependencyController<TValues>;
  readonly conditions: ConditionController<TValues>;
  /**
   * Opt-in diagnostic trace for debugging and DevTools.
   *
   * @experimental Diagnostics contract; see STABILITY.md.
   */
  readonly diagnostics: RuntimeDiagnostics;

  private readonly recorder: DiagnosticsRecorder;
  /** Paths whose next value change comes from a hidden-value policy. */
  private readonly pendingHiddenClears = new Set<string>();
  private readonly pluginHost!: CorePluginHost<TValues>;
  private readonly lifecycleListeners = new Set<RuntimeLifecycleListener<TValues>>();
  private readonly unsubscribers: Array<() => void>;
  private disposed = false;
  private ready = false;

  constructor(schema: FormSchema, initialValues: TValues = {} as TValues, options: FormRuntimeOptions<TValues> = {}) {
    if (options.onLifecycle) this.lifecycleListeners.add(options.onLifecycle);
    this.compiledSchema = compileSchemaOrThrow(schema, options.schema);
    this.schema = this.compiledSchema.schema;
    const normalizedInitialValues = mergeSchemaInitialValues<TValues>(this.schema, initialValues);
    this.store = new FormStore<TValues>(normalizedInitialValues, options.store);
    this.recorder = new DiagnosticsRecorder(options.diagnostics);
    this.diagnostics = this.recorder;
    // Registered before the controllers so value changes are recorded before
    // the condition and dependency transitions they cause.
    const recorderUnsubscribers = this.subscribeRecorder();
    this.dataSources = new DataSourceManager({
      ...options.dataSources,
      onRequest: (event) => {
        options.dataSources?.onRequest?.(event);
        this.recorder.record({ type: 'dataSourceRequest', path: event.name, requestId: event.requestId, phase: event.phase, ...(event.error ? { error: event.error.message } : {}) });
      },
    });
    this.dependencies = new DependencyController(this.store, this.compiledSchema, {
      onEvaluate: (paths) => {
        if (this.ready) this.emitLifecycle({ phase: 'dependencies', paths, async: false });
      },
      onRefresh: (event) => {
        this.recorder.record({ type: 'dependencyRefresh', path: event.field, action: event.action, via: Object.freeze([...event.via]), cause: this.diagnosticCause(event.cause) });
      },
      onDataSourceRefresh: async (_field, dataSource, values, context) => {
        await Promise.resolve();
        context.signal.throwIfAborted();
        this.emitLifecycle({ phase: 'dataSource', paths: [context.field], async: true });
        await this.dataSources.loadConfig(
          context.field,
          dataSource,
          { values: values as Record<string, unknown>, ...context },
          { signal: context.signal },
        );
      },
    });
    this.conditions = new ConditionController(
      this.store,
      this.compiledSchema,
      options.onConditionChange,
      (paths) => {
        if (this.ready) this.emitLifecycle({ phase: 'conditions', paths, async: false });
      },
      (path, state, details) => {
        // Mirrors ConditionController: a hidden `clear` only writes when a value is present.
        if (details.hiddenValuePolicy === 'clear' && this.store.getValue(dynamicPath(path)) !== undefined) this.pendingHiddenClears.add(path);
        if (this.recorder.enabled) {
          const current = Object.freeze({ ...state });
          const previous = details.previous ? Object.freeze({ ...details.previous }) : undefined;
          this.recorder.record({
            type: 'conditionChange',
            path,
            state: current,
            ...(previous ? { previous } : {}),
            changed: Object.freeze(changedFlags(current, previous)),
            cause: this.diagnosticCause(details.cause),
            ...(details.hiddenValuePolicy ? { hiddenValuePolicy: details.hiddenValuePolicy } : {}),
          });
        }
      },
    );
    const pluginContext: CorePluginContext<TValues> = Object.freeze({
      schema: this.schema,
      getState: () => this.store.getState(),
      getConditionState: (path: string) => {
        const state = this.conditions.getState(path);
        return state ? Object.freeze({ ...state }) : undefined;
      },
      getDataSourceState: <T = unknown>(name: string) => {
        const state = this.dataSources.getState<T>(name);
        return state
          ? Object.freeze({ ...state, data: cloneReadonly(state.data) })
          : undefined;
      },
    });
    this.pluginHost = new CorePluginHost(
      options.plugins ?? [],
      pluginContext,
      options.onPluginError,
    );
    this.unsubscribers = [
      ...recorderUnsubscribers,
      this.store.on('valueChange', (formEvent) => {
        this.emitLifecycle({ phase: 'events', paths: formEvent.field ? [formEvent.field] : [], formEvent, async: false });
      }),
      this.store.on('fieldChange', (formEvent) => {
        this.emitLifecycle({ phase: 'events', paths: formEvent.field ? [formEvent.field] : [], formEvent, async: false });
      }),
      this.store.on('reset', (formEvent) => {
        this.emitLifecycle({ phase: 'events', formEvent, async: false });
      }),
      this.store.on('validate', (formEvent) => {
        this.emitLifecycle({ phase: 'events', formEvent, async: false });
      }),
      this.store.on('submit', (formEvent) => {
        this.emitLifecycle({ phase: 'events', formEvent, async: false });
      }),
      this.store.subscribe(() => this.emitLifecycle({ phase: 'notification', async: false })),
    ];
    this.ready = true;
  }

  onLifecycle(listener: RuntimeLifecycleListener<TValues>): () => void {
    this.assertActive();
    this.lifecycleListeners.add(listener);
    return () => this.lifecycleListeners.delete(listener);
  }

  explainField(path: string): CompiledFieldExplanation {
    this.assertActive();
    return explainField(this.compiledSchema, path);
  }

  /**
   * Explains the field's current runtime state: why it is visible, disabled,
   * read-only, or required, which rule produced its error, its dependencies,
   * and its data-source request state. Values are redacted unless requested.
   *
   * @experimental Diagnostics contract; see STABILITY.md.
   */
  explainFieldState(path: string, options: ExplainFieldStateOptions = {}): FieldStateExplanation {
    this.assertActive();
    const state = this.conditions.getState(path) ?? this.findConditionState(path);
    return buildFieldStateExplanation({
      path,
      compiled: this.compiledSchema,
      values: this.store.getValues(),
      errors: this.store.getState().errors,
      conditionState: state,
      dataSourceState: this.dataSources.getState(path),
      recorder: this.recorder,
      includeValues: options.includeValues ?? this.recorder.includeValues,
    });
  }

  setValue<TPath extends Path<TValues>>(
    path: TPath,
    value: PathValue<TValues, TPath>,
    options?: SetValueOptions,
  ): void {
    this.assertActive();
    const mutation = this.pluginHost.interceptMutation({ type: 'setValue', path, value, options });
    if ('cancel' in mutation) return;
    this.emitLifecycle({ phase: 'mutation', operation: 'setValue', paths: [mutation.path], async: false });
    this.store.setValue(dynamicPath(mutation.path), mutation.value, mutation.options);
  }

  setValues(values: Partial<TValues>, options?: SetValueOptions): void {
    this.assertActive();
    const mutation = this.pluginHost.interceptMutation({ type: 'setValues', values, options });
    if ('cancel' in mutation) return;
    this.emitLifecycle({
      phase: 'mutation',
      operation: 'setValues',
      paths: Object.keys(mutation.values),
      async: false,
    });
    this.store.setValues(mutation.values as Partial<TValues>, mutation.options);
  }

  batch<TResult>(operation: () => TResult): TResult {
    this.assertActive();
    this.emitLifecycle({ phase: 'mutation', operation: 'batch', async: false });
    return this.store.batch(operation);
  }

  reset(values?: TValues, options?: ResetOptions): void {
    this.assertActive();
    const mutation = this.pluginHost.interceptMutation({ type: 'reset', values, options });
    if ('cancel' in mutation) return;
    this.emitLifecycle({ phase: 'mutation', operation: 'reset', async: false });
    const resetValues = mutation.values ? mergeSchemaInitialValues<TValues>(this.schema, mutation.values as Partial<TValues>) : undefined;
    this.store.reset(resetValues, mutation.options);
  }

  async validate(validator: FormValidator<TValues>, options?: ValidateOptions): Promise<boolean> {
    this.assertActive();
    this.emitLifecycle({ phase: 'validation', operation: 'validate', async: true });
    return this.store.validate(validator, options);
  }

  async submit<TResult>(
    handler: FormSubmitHandler<TValues, TResult>,
    validator?: FormValidator<TValues>,
  ): Promise<TResult | undefined> {
    this.assertActive();
    this.emitLifecycle({ phase: 'validation', operation: 'submit', async: true });
    return this.store.submit(handler, validator);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.pluginHost.dispose();
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.dependencies.dispose();
    this.conditions.dispose();
    this.dataSources.clear();
    this.store.cancelValidation();
    this.lifecycleListeners.clear();
    this.recorder.dispose();
    this.pendingHiddenClears.clear();
  }

  private subscribeRecorder(): Array<() => void> {
    return [
      this.store.on('valueChange', (formEvent) => {
        if (!formEvent.field) return;
        const path = formEvent.field;
        const fromHiddenPolicy = this.pendingHiddenClears.delete(path) || [...this.pendingHiddenClears].some((pending) => isSamePath(pending, path) && this.pendingHiddenClears.delete(pending));
        if (!this.recorder.enabled) return;
        const includeValues = this.recorder.includeValues;
        this.recorder.record({
          type: 'valueChange',
          path,
          origin: fromHiddenPolicy ? 'hiddenValuePolicy' : 'api',
          valueType: describeValueType(formEvent.value),
          previousValueType: describeValueType(formEvent.previousValue),
          ...(includeValues ? { value: formEvent.value, previousValue: formEvent.previousValue } : {}),
        });
      }),
      this.store.on('reset', () => {
        this.pendingHiddenClears.clear();
        this.recorder.record({ type: 'reset' });
      }),
      this.store.on('validate', (formEvent) => {
        if (!this.recorder.enabled) return;
        const payload = formEvent.payload && 'errors' in formEvent.payload ? formEvent.payload : undefined;
        const errors = payload?.errors ?? this.store.getState().errors;
        this.recorder.record({ type: 'validation', valid: payload?.valid ?? Object.keys(errors).length === 0, errorPaths: Object.freeze(Object.keys(errors)) });
      }),
    ];
  }

  private diagnosticCause(cause: ConditionEvaluationCause | DependencyRefreshCause): DiagnosticCause {
    if (cause.type === 'initial') return Object.freeze({ type: 'initial' });
    if (cause.type === 'reset') {
      const sequence = this.recorder.resetSequence();
      return Object.freeze({ type: 'reset', ...(sequence !== undefined ? { sequence } : {}) });
    }
    const sequence = this.recorder.valueChangeSequence(cause.path);
    return Object.freeze({ type: 'valueChange', path: cause.path, ...(sequence !== undefined ? { sequence } : {}) });
  }

  private findConditionState(path: string): FieldConditionState | undefined {
    for (const candidate of this.compiledSchema.fieldsByPath.keys()) {
      if (isSamePath(candidate, path)) return this.conditions.getState(candidate);
    }
    return undefined;
  }

  private emitLifecycle(event: RuntimeLifecycleEvent<TValues>): void {
    if (this.disposed) return;
    const frozenEvent = Object.freeze(event);
    this.pluginHost.emitLifecycle(frozenEvent);
    for (const listener of this.lifecycleListeners) listener(frozenEvent);
  }

  private assertActive(): void {
    if (this.disposed) throw new Error('FormRuntime has been disposed.');
  }
}

/**
 * Construct a runtime whose value contract is inferred from a const schema.
 * Use the FormRuntime constructor directly when supplying an explicit value type.
 */
export function createFormRuntime<const TSchema extends FormSchema>(
  schema: TSchema,
  initialValues?: InferFormValues<TSchema>,
  options?: FormRuntimeOptions<InferFormValues<TSchema>>,
): FormRuntime<InferFormValues<TSchema>> {
  return new FormRuntime<InferFormValues<TSchema>>(
    schema,
    initialValues ?? ({} as InferFormValues<TSchema>),
    options,
  );
}

function cloneReadonly<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value;
  const existing = seen.get(value);
  if (existing) return existing as T;
  const clone: unknown = Array.isArray(value) ? [] : {};
  seen.set(value, clone);
  for (const [key, nested] of Object.entries(value)) {
    (clone as Record<string, unknown>)[key] = cloneReadonly(nested, seen);
  }
  return Object.freeze(clone) as T;
}

function changedFlags(current: FieldConditionState, previous?: FieldConditionState): (keyof FieldConditionState)[] {
  const keys: (keyof FieldConditionState)[] = ['visible', 'disabled', 'required', 'readOnly'];
  return previous ? keys.filter((key) => current[key] !== previous[key]) : keys;
}
