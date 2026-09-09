import { ConditionController } from '../conditions';
import { DataSourceManager } from '../datasource';
import { DependencyController } from '../dependencies';
import type { FormSchema } from '../schema';
import {
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
  readonly store: FormStore<TValues>;
  readonly dataSources: DataSourceManager;
  readonly dependencies: DependencyController<TValues>;
  readonly conditions: ConditionController<TValues>;

  private readonly lifecycleListeners = new Set<RuntimeLifecycleListener<TValues>>();
  private readonly unsubscribers: Array<() => void>;
  private disposed = false;
  private ready = false;

  constructor(schema: FormSchema, initialValues: TValues = {} as TValues, options: FormRuntimeOptions<TValues> = {}) {
    if (options.onLifecycle) this.lifecycleListeners.add(options.onLifecycle);
    this.store = new FormStore(initialValues, options.store);
    this.dataSources = new DataSourceManager(options.dataSources);
    this.dependencies = new DependencyController(this.store, schema, {
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
    this.emitLifecycle({ phase: 'mutation', operation: 'setValue', paths: [path], async: false });
    this.store.setValue(path, value, options);
  }

  setValues(values: Partial<TValues>, options?: SetValueOptions): void {
    this.assertActive();
    this.emitLifecycle({ phase: 'mutation', operation: 'setValues', paths: Object.keys(values), async: false });
    this.store.setValues(values, options);
  }

  batch<TResult>(operation: () => TResult): TResult {
    this.assertActive();
    this.emitLifecycle({ phase: 'mutation', operation: 'batch', async: false });
    return this.store.batch(operation);
  }

  reset(values?: TValues, options?: ResetOptions): void {
    this.assertActive();
    this.emitLifecycle({ phase: 'mutation', operation: 'reset', async: false });
    this.store.reset(values, options);
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
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.dependencies.dispose();
    this.conditions.dispose();
    this.dataSources.clear();
    this.store.cancelValidation();
    this.lifecycleListeners.clear();
  }

  private emitLifecycle(event: RuntimeLifecycleEvent<TValues>): void {
    if (this.disposed) return;
    for (const listener of this.lifecycleListeners) listener(Object.freeze(event));
  }

  private assertActive(): void {
    if (this.disposed) throw new Error('FormRuntime has been disposed.');
  }
}

