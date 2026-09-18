import type { FieldCondition } from '../conditions';
import { normalizePath } from '../store';
import { SchemaNormalizationError, normalizeSchema, type NormalizeSchemaOptions, type NormalizedFieldSchema, type NormalizedFormSchema, type SchemaDiagnostic } from './normalization';
import type { FormSchema } from './types';

export interface CompiledDependencyGraph { readonly dependenciesByField: ReadonlyMap<string, readonly string[]>; readonly dependentsByField: ReadonlyMap<string, readonly string[]>; }
export interface CompiledFormSchema<TCustomValue = never> {
  readonly schema: NormalizedFormSchema<TCustomValue>;
  readonly fieldsByPath: ReadonlyMap<string, NormalizedFieldSchema<TCustomValue>>;
  readonly dependencyGraph: CompiledDependencyGraph;
  readonly conditionDependentsByField: ReadonlyMap<string, readonly string[]>;
  readonly dataSourceDependentsByField: ReadonlyMap<string, readonly string[]>;
  readonly validationByPath: ReadonlyMap<string, Readonly<NormalizedFieldSchema<TCustomValue>['validation']>>;
  readonly defaultsByPath: ReadonlyMap<string, unknown>;
  readonly diagnostics: readonly SchemaDiagnostic[];
}
export interface SchemaCompileResult<TCustomValue = never> { readonly valid: boolean; readonly schema?: CompiledFormSchema<TCustomValue>; readonly diagnostics: readonly SchemaDiagnostic[]; }
export interface CompiledFieldExplanation<TCustomValue = never> {
  readonly path: string;
  readonly field?: NormalizedFieldSchema<TCustomValue>;
  readonly dependencies: readonly string[];
  readonly dependents: readonly string[];
  readonly conditionSources: readonly string[];
  readonly dataSourceSources: readonly string[];
  readonly hasValidation: boolean;
  readonly hasDefault: boolean;
}

export function compileSchema<TCustomValue = never>(input: FormSchema<TCustomValue> | unknown, options: Omit<NormalizeSchemaOptions, 'throwOnError'> = {}): SchemaCompileResult<TCustomValue> {
  const normalized = normalizeSchema<TCustomValue>(input, options);
  if (!normalized.schema) return Object.freeze({ valid: false, diagnostics: normalized.diagnostics });
  const fields = new Map<string, NormalizedFieldSchema<TCustomValue>>(); collectFields(normalized.schema.fields, '', fields);
  const dependencies = new Map<string, readonly string[]>(), dependents = new Map<string, string[]>(), conditions = new Map<string, string[]>(), dataSources = new Map<string, string[]>();
  const validation = new Map<string, Readonly<NormalizedFieldSchema<TCustomValue>['validation']>>(), defaults = new Map<string, unknown>();
  for (const [path, field] of fields) {
    dependencies.set(path, Object.freeze([...field.dependsOn]));
    for (const source of field.dependsOn) append(dependents, source, path);
    for (const condition of [field.visibleWhen, field.disabledWhen, field.requiredWhen, field.readOnlyWhen]) for (const source of conditionReferences(condition)) append(conditions, source, path);
    if (field.dataSource) for (const source of dataSourceReferences(field.dataSource.params)) append(dataSources, source, path);
    if (Object.keys(field.validation).length) validation.set(path, field.validation);
    if (field.defaultValue !== undefined) defaults.set(path, field.defaultValue);
  }
  const compiled: CompiledFormSchema<TCustomValue> = Object.freeze({ schema: normalized.schema, fieldsByPath: readonlyMap(fields), dependencyGraph: Object.freeze({ dependenciesByField: readonlyMap(dependencies), dependentsByField: readonlyArrayMap(dependents) }), conditionDependentsByField: readonlyArrayMap(conditions), dataSourceDependentsByField: readonlyArrayMap(dataSources), validationByPath: readonlyMap(validation), defaultsByPath: readonlyMap(defaults), diagnostics: normalized.diagnostics });
  return Object.freeze({ valid: true, schema: compiled, diagnostics: normalized.diagnostics });
}
export function compileSchemaOrThrow<TCustomValue = never>(input: FormSchema<TCustomValue> | unknown, options: Omit<NormalizeSchemaOptions, 'throwOnError'> = {}): CompiledFormSchema<TCustomValue> { const result = compileSchema<TCustomValue>(input, options); if (!result.schema) throw new SchemaNormalizationError(result.diagnostics); return result.schema; }
export function explainField<TCustomValue>(compiled: CompiledFormSchema<TCustomValue>, path: string): CompiledFieldExplanation<TCustomValue> {
  const canonical = normalizePath(path);
  return Object.freeze({
    path: canonical,
    field: compiled.fieldsByPath.get(canonical),
    dependencies: compiled.dependencyGraph.dependenciesByField.get(canonical) ?? Object.freeze([]),
    dependents: compiled.dependencyGraph.dependentsByField.get(canonical) ?? Object.freeze([]),
    conditionSources: Object.freeze(reverseLookup(compiled.conditionDependentsByField, canonical)),
    dataSourceSources: Object.freeze(reverseLookup(compiled.dataSourceDependentsByField, canonical)),
    hasValidation: compiled.validationByPath.has(canonical),
    hasDefault: compiled.defaultsByPath.has(canonical),
  });
}
function collectFields<T>(items: readonly NormalizedFieldSchema<T>[], parent: string, target: Map<string, NormalizedFieldSchema<T>>): void { for (const field of items) { const path = parent ? `${parent}.${field.name}` : field.name; target.set(path, field); collectFields(field.fields, path, target); } }
function append(target: Map<string, string[]>, source: string, dependent: string): void { const canonical = normalizePath(source); const values = target.get(canonical) ?? []; if (!values.includes(dependent)) values.push(dependent); target.set(canonical, values); }
function conditionReferences(condition: FieldCondition | undefined): readonly string[] { if (!condition) return []; if ('field' in condition) return [condition.field]; return [...(condition.and ?? []).flatMap(conditionReferences), ...(condition.or ?? []).flatMap(conditionReferences), ...conditionReferences(condition.not)]; }
function dataSourceReferences(params: Readonly<Record<string, unknown>> | undefined): readonly string[] { const output = new Set<string>(); const visit = (value: unknown): void => { if (typeof value === 'string' && value.startsWith('$') && value.length > 1) output.add(value.slice(1)); else if (isRecord(value) && typeof value.fromField === 'string') output.add(value.fromField); if (Array.isArray(value)) value.forEach(visit); else if (isRecord(value)) Object.values(value).forEach(visit); }; visit(params); return [...output]; }
function readonlyArrayMap(source: Map<string, string[]>): ReadonlyMap<string, readonly string[]> { return readonlyMap(new Map([...source].map(([key, values]) => [key, Object.freeze([...values])] as const))); }
function readonlyMap<K, V>(source: ReadonlyMap<K, V>): ReadonlyMap<K, V> {
  const data = new Map(source);
  const facade: ReadonlyMap<K, V> = Object.freeze({
    get size() { return data.size; },
    get: (key: K) => data.get(key),
    has: (key: K) => data.has(key),
    entries: () => data.entries(),
    keys: () => data.keys(),
    values: () => data.values(),
    forEach: (callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: unknown) =>
      data.forEach((value, key) => callback.call(thisArg, value, key, facade)),
    [Symbol.iterator]: () => data[Symbol.iterator](),
    [Symbol.toStringTag]: 'ReadonlyMap',
  });
  return facade;
}
function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function reverseLookup(index: ReadonlyMap<string, readonly string[]>, dependent: string): string[] { return [...index].filter(([, values]) => values.includes(dependent)).map(([source]) => source); }
