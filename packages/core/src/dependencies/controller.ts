import { AsyncRequestManager, isAbortError, type AsyncRequestContext } from '../async';
import { dynamicPath, getByPath, normalizePath } from '../store';
import type { DataSourceConfig } from '../datasource';
import type { FormStore, FormValues } from '../store';
import type { CompiledFormSchema, FieldSchema, FormSchema } from '../schema';
import { DependencyGraph } from './graph';

export interface DependencyRefreshContext extends AsyncRequestContext {
  field: string;
}

/**
 * What triggered dependency processing.
 *
 * @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md.
 */
export type DependencyRefreshCause =
  | { readonly type: 'valueChange'; readonly path: string }
  | { readonly type: 'reset' };

/**
 * Reported once per action taken on a dependent field.
 *
 * @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md.
 */
export interface DependencyRefreshEvent {
  /** The dependent field being refreshed. */
  readonly field: string;
  /** The field whose change started this refresh, or a form reset. */
  readonly cause: DependencyRefreshCause;
  /** Direct dependencies of `field` through which the change arrived. */
  readonly via: readonly string[];
  readonly action: 'reset' | 'dataSource';
}

export interface DependencyControllerOptions<T extends FormValues> {
  onDataSourceRefresh?: (
    field: FieldSchema,
    dataSource: DataSourceConfig,
    values: Readonly<T>,
    context: DependencyRefreshContext,
  ) => void | Promise<void>;
  onAsyncError?: (error: Error, field: string, requestId: number) => void;
  onEvaluate?: (paths: readonly string[]) => void;
  /**
   * Called before each dependent-field action. Intended for diagnostics.
   *
   * @experimental Diagnostics contract; see STABILITY.md.
   */
  onRefresh?: (event: DependencyRefreshEvent) => void;
}

export class DependencyController<T extends FormValues = FormValues> {
  private readonly fields = new Map<string, FieldSchema>();
  private readonly graph: DependencyGraph;
  private readonly watchedPaths: readonly string[];
  private readonly unsubscribers: readonly (() => void)[];
  private readonly requests: AsyncRequestManager<string>;

  constructor(store: FormStore<T>, schema: FormSchema | CompiledFormSchema, options: DependencyControllerOptions<T> = {}) {
    this.requests = new AsyncRequestManager({ onError: options.onAsyncError });
    if ('fieldsByPath' in schema) for (const [path, field] of schema.fieldsByPath) this.fields.set(path, field);
    else collectFields(schema.fields, '', this.fields);
    const dependencies = 'fieldsByPath' in schema
      ? [...schema.dependencyGraph.dependenciesByField].filter(([, values]) => values.length).map(([field, dependsOn]) => ({ field, dependsOn: [...dependsOn] }))
      : [...this.fields].flatMap(([path, field]) => field.dependsOn?.length ? [{ field: path, dependsOn: [...field.dependsOn] }] : []);
    this.graph = new DependencyGraph(dependencies);
    this.watchedPaths = [...new Set(dependencies.flatMap((dependency) => dependency.dependsOn))];
    const watched = this.watchedPaths.map((declared) => ({ declared, canonical: normalizePath(declared) }));
    const process = (sources: readonly string[], cause: DependencyRefreshCause) => {
      const affected = new Set(sources.flatMap((field) => this.graph.getTransitiveDependents(field)));
      options.onEvaluate?.([...affected]);
      for (const dependentPath of affected) {
        const dependent = this.fields.get(dependentPath)!;
        const via = options.onRefresh ? this.graph.getDependencies(dependentPath).filter((dependency) => sources.includes(dependency) || affected.has(dependency)) : [];
        if (dependent.resetOnDependencyChange) {
          options.onRefresh?.({ field: dependentPath, cause, via, action: 'reset' });
          store.resetField(dynamicPath(dependentPath));
        }
        if (dependent.dataSource && options.onDataSourceRefresh) {
          options.onRefresh?.({ field: dependentPath, cause, via, action: 'dataSource' });
          const values = store.getValues();
          void this.requests.run(
            dependentPath,
            (context) => options.onDataSourceRefresh!(dependent, dependent.dataSource!, values, { ...context, field: dependentPath }),
          ).catch((error: unknown) => {
            if (!isAbortError(error)) {
              // The centralized onAsyncError callback has already received current failures.
            }
          });
        }
      }
    };
    // A declared dependency changed when the mutated path is the dependency (in
    // any spelling), lies inside it, or replaced an ancestor whose new value
    // differs at the dependency's position.
    const changedDependencies = (changedPath: string, previousValue: unknown, value: unknown): string[] => {
      const changed = normalizePath(changedPath);
      return watched.filter(({ canonical }) => {
        if (canonical === changed || changed.startsWith(`${canonical}.`)) return true;
        if (!canonical.startsWith(`${changed}.`)) return false;
        const relative = dynamicPath(canonical.slice(changed.length + 1));
        return !Object.is(getByPath(previousValue, relative), getByPath(value, relative));
      }).map(({ declared }) => declared);
    };
    this.unsubscribers = [
      store.on('valueChange', (event) => {
        if (event.field) process(changedDependencies(event.field, event.previousValue, event.value), { type: 'valueChange', path: event.field });
      }),
      store.on('reset', () => process(this.watchedPaths, { type: 'reset' })),
    ];
  }

  cancelRefresh(field: string): void {
    this.requests.cancel(field);
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.requests.clear();
  }
}

function collectFields(fields: readonly FieldSchema[], parent: string, target: Map<string, FieldSchema>): void {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    target.set(path, field);
    if (field.fields) collectFields(field.fields, path, target);
  }
}
