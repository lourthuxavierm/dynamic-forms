import { ConditionController } from '../conditions';
import { DataSourceManager } from '../datasource';
import { DependencyController } from '../dependencies';
import { CorePluginHost, type CorePluginContext } from '../plugins';
import { createInitialValues, normalizeSchemaOrThrow, type FormSchema, type NormalizedFormSchema } from '../schema';
import {
  dynamicPath,
  FormStore,
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
  readonly store: FormStore<TValues>;
  readonly dataSources: DataSourceManager;
  readonly dependencies: DependencyController<TValues>;
  readonly conditions: ConditionController<TValues>;

  private readonly pluginHost!: CorePluginHost<TValues>;
  private readonly lifecycleListeners = new Set<RuntimeLifecycleListener<TValues>>();
  private readonly unsubscribers: Array<() => void>;
  private disposed = false;
  private ready = false;

  constructor(schema: FormSchema, initialValues: TValues = {} as TValues, options: FormRuntimeOptions<TValues> = {}) {
    if (options.onLifecycle) this.lifecycleListeners.add(options.onLifecycle);
    this.schema = normalizeSchemaOrThrow(schema, options.schema);
    const normalizedInitialValues = { ...createInitialValues(this.schema), ...initialValues } as TValues;
    this.store = new FormStore(normalizedInitialValues, options.store);
    this.dataSources = new DataSourceManager(options.dataSources);
    this.dependencies = new DependencyController(this.store, this.schema, {
      onEvaluate: (paths) => {
        if (this.ready) this.emitLifecycle({ phase: 'dependencies', paths, async: false });
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
      schema,
      options.onConditionChange,
      (paths) => {
        if (this.ready) this.emitLifecycle({ phase: 'conditions', paths, async: false });
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
    this.store.reset(mutation.values as TValues | undefined, mutation.options);
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
