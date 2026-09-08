import { AsyncRequestManager, isAbortError, type AsyncRequestContext } from '../async';
import { dynamicPath } from '../store';
import type { DataSourceConfig } from '../datasource';
import type { FormStore, FormValues } from '../store';
import type { FieldSchema, FormSchema } from '../schema';
import { DependencyGraph } from './graph';

export interface DependencyControllerOptions<T extends FormValues> {
  onDataSourceRefresh?: (
    field: FieldSchema,
    dataSource: DataSourceConfig,
    values: Readonly<T>,
    context: AsyncRequestContext,
  ) => void | Promise<void>;
  onAsyncError?: (error: Error, field: string, requestId: number) => void;
}

export class DependencyController<T extends FormValues = FormValues> {
  private readonly fields = new Map<string, FieldSchema>();
  private readonly graph: DependencyGraph;
  private readonly watchedPaths: readonly string[];
  private readonly unsubscribers: readonly (() => void)[];
  private readonly requests: AsyncRequestManager<string>;

  constructor(store: FormStore<T>, schema: FormSchema, options: DependencyControllerOptions<T> = {}) {
    this.requests = new AsyncRequestManager({ onError: options.onAsyncError });
    collectFields(schema.fields, '', this.fields);
    const dependencies = [...this.fields].flatMap(([path, field]) => field.dependsOn?.length
      ? [{ field: path, dependsOn: [...field.dependsOn] }]
      : []);
    this.graph = new DependencyGraph(dependencies);
    this.watchedPaths = [...new Set(dependencies.flatMap((dependency) => dependency.dependsOn))];
    const process = (changedFields: readonly string[]) => {
      const affected = new Set(changedFields.flatMap((field) => this.graph.getTransitiveDependents(field)));
      for (const dependentPath of affected) {
        const dependent = this.fields.get(dependentPath)!;
        if (dependent.resetOnDependencyChange) store.resetField(dynamicPath(dependentPath));
        if (dependent.dataSource && options.onDataSourceRefresh) {
          const values = store.getValues();
          void this.requests.run(
            dependentPath,
            (context) => options.onDataSourceRefresh!(dependent, dependent.dataSource!, values, context),
          ).catch((error: unknown) => {
            if (!isAbortError(error)) {
              // The centralized onAsyncError callback has already received current failures.
            }
          });
        }
      }
    };
    this.unsubscribers = [
      store.on('valueChange', (event) => { if (event.field) process([event.field]); }),
      store.on('reset', () => process(this.watchedPaths)),
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
