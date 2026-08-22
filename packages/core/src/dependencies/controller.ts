import type { DataSourceConfig } from '../datasource';
import type { FormStore, FormValues } from '../store';
import type { FieldSchema, FormSchema } from '../schema';
import { DependencyGraph } from './graph';

export interface DependencyControllerOptions<T extends FormValues> {
  onDataSourceRefresh?: (field: FieldSchema, dataSource: DataSourceConfig, values: Readonly<T>) => void | Promise<void>;
}

export class DependencyController<T extends FormValues = FormValues> {
  private readonly fields = new Map<string, FieldSchema>();
  private readonly graph: DependencyGraph;
  private readonly watchedPaths: readonly string[];
  private readonly unsubscribe: () => void;
  private previousValues: T;

  constructor(store: FormStore<T>, schema: FormSchema, options: DependencyControllerOptions<T> = {}) {
    collectFields(schema.fields, '', this.fields);
    const dependencies = [...this.fields].flatMap(([path, field]) => field.dependsOn?.length ? [{ field: path, dependsOn: [...field.dependsOn] }] : []);
    this.graph = new DependencyGraph(dependencies);
    this.watchedPaths = [...new Set(dependencies.flatMap((dependency) => dependency.dependsOn))];
    this.previousValues = store.getValues();
    this.unsubscribe = store.subscribe((state) => {
      const changedFields = findChangedFields(this.previousValues, state.values, this.watchedPaths);
      this.previousValues = state.values;
      const affected = new Set(changedFields.flatMap((field) => this.graph.getTransitiveDependents(field)));
      for (const dependentPath of affected) {
        const dependent = this.fields.get(dependentPath)!;
        if (dependent.resetOnDependencyChange) store.resetField(dependentPath);
        if (dependent.dataSource) void options.onDataSourceRefresh?.(dependent, dependent.dataSource, store.getValues());
      }
    });
  }

  dispose(): void { this.unsubscribe(); }
}

function collectFields(fields: readonly FieldSchema[], parent: string, target: Map<string, FieldSchema>): void {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    target.set(path, field);
    if (field.fields) collectFields(field.fields, path, target);
  }
}

function findChangedFields<T extends FormValues>(previous: T, current: T, fields: Iterable<string>): string[] {
  const changed: string[] = [];
  for (const field of fields) {
    const get = (values: Record<string, unknown>) => field.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, values);
    if (!Object.is(get(previous), get(current))) changed.push(field);
  }
  return changed;
}
