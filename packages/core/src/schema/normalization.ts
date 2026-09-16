import type { FieldCondition } from '../conditions';
import type { DataSourceConfig } from '../datasource';
import type { FormValues } from '../store';
import { normalizePath } from '../store';
import type { FieldOption, FieldSchema, FieldValidation, FieldValue, FormSchema } from './types';
import { validateSchema, type SchemaValidationCode } from './validation';

export const CURRENT_SCHEMA_VERSION = 1 as const;
export type SchemaDiagnosticCode = SchemaValidationCode | 'SCHEMA_INVALID' | 'SCHEMA_UNSUPPORTED_VERSION' | 'SCHEMA_MIGRATION_MISSING' | 'DEPENDENCY_CYCLE' | 'SELECT_WITHOUT_OPTIONS' | 'HIDDEN_REQUIRED_FIELD' | 'DEPRECATED_PROPERTY';
export interface SchemaDiagnostic {
  code: SchemaDiagnosticCode;
  severity: 'error' | 'warning' | 'info';
  path: string;
  message: string;
  relatedPath?: string;
  details?: Readonly<Record<string, unknown>>;
  /** @deprecated Use relatedPath. */
  reference?: string;
}
export interface SchemaMigration { from: number; to: number; migrate(schema: Readonly<Record<string, unknown>>): unknown; }
export interface NormalizeSchemaOptions { migrations?: readonly SchemaMigration[]; throwOnError?: boolean; }
export type NormalizedFieldSchema<TCustomValue = never> = Readonly<Omit<FieldSchema<TCustomValue>, 'label' | 'defaultValue' | 'hiddenValuePolicy' | 'dependsOn' | 'resetOnDependencyChange' | 'dataSource' | 'options' | 'validation' | 'fields' | 'required'> & {
  label: string; defaultValue: FieldValue | TCustomValue | undefined;
  hiddenValuePolicy: 'preserve' | 'clear' | 'reset'; dependsOn: readonly string[];
  resetOnDependencyChange: boolean; dataSource?: Readonly<DataSourceConfig>;
  options: readonly Readonly<FieldOption>[]; validation: Readonly<FieldValidation>;
  fields: readonly NormalizedFieldSchema<TCustomValue>[];
}>;
export interface NormalizedFormSchema<TCustomValue = never> extends Omit<FormSchema<TCustomValue>, 'schemaVersion' | 'fields'> {
  readonly schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  readonly fields: readonly NormalizedFieldSchema<TCustomValue>[];
}
export interface SchemaNormalizationResult<TCustomValue = never> { valid: boolean; schema?: NormalizedFormSchema<TCustomValue>; diagnostics: readonly SchemaDiagnostic[]; }

export class SchemaNormalizationError extends Error {
  readonly diagnostics: readonly SchemaDiagnostic[];
  constructor(diagnostics: readonly SchemaDiagnostic[]) {
    super(`Schema normalization failed: ${diagnostics[0]?.message ?? 'Unknown schema error'}`);
    this.name = 'SchemaNormalizationError'; this.diagnostics = diagnostics;
  }
}

export function normalizeSchema<TCustomValue = never>(input: FormSchema<TCustomValue> | unknown, options: NormalizeSchemaOptions = {}): SchemaNormalizationResult<TCustomValue> {
  const diagnostics: SchemaDiagnostic[] = [];
  const migrated = migrateToCurrent(input, options.migrations ?? [], diagnostics);
  if (!isFormSchema(migrated)) {
    if (diagnostics.length === 0) diagnostics.push(diag('SCHEMA_INVALID', '', 'Schema must contain a non-empty id and a fields array.'));
    return finish(undefined, diagnostics, options.throwOnError);
  }
  for (const error of validateSchema(migrated).errors) {
    diagnostics.push({ code: error.code, severity: 'error', path: error.path, message: error.message, relatedPath: error.relatedPath, reference: error.relatedPath, details: error.details });
  }
  diagnostics.push(...detectCycles(migrated.fields));
  collectWarnings(migrated.fields, '', diagnostics);
  if (diagnostics.some((item) => item.severity === 'error')) return finish(undefined, diagnostics, options.throwOnError);
  const schema = deepFreeze({ ...migrated, schemaVersion: CURRENT_SCHEMA_VERSION, fields: migrated.fields.map(normalizeField) }) as NormalizedFormSchema<TCustomValue>;
  return finish(schema, diagnostics, options.throwOnError);
}

export function normalizeSchemaOrThrow<TCustomValue = never>(schema: FormSchema<TCustomValue> | unknown, options: Omit<NormalizeSchemaOptions, 'throwOnError'> = {}): NormalizedFormSchema<TCustomValue> {
  return normalizeSchema<TCustomValue>(schema, { ...options, throwOnError: true }).schema!;
}

export function createInitialValues(schema: NormalizedFormSchema<unknown>): FormValues {
  return Object.fromEntries(schema.fields.map((field) => [field.name, clone(field.defaultValue)]));
}

/** Schema defaults recursively merged beneath explicit runtime values. Arrays are replaced, not index-merged. */
export function mergeSchemaInitialValues<T extends FormValues>(schema: NormalizedFormSchema<unknown>, initialValues: Partial<T>): T {
  return mergeValues(createInitialValues(schema), initialValues) as T;
}

/** Creates a fresh default item for an array field using its normalized child schema. */
export function createArrayItemValue(schema: NormalizedFormSchema<unknown>, arrayPath: string): unknown {
  const segments = normalizePath(arrayPath).split('.').filter((segment) => !/^\d+$/.test(segment));
  let fields = schema.fields;
  let field: NormalizedFieldSchema<unknown> | undefined;
  for (const segment of segments) { field = fields.find((candidate) => candidate.name === segment); if (!field) return undefined; fields = field.fields; }
  if (field?.type !== 'array') return undefined;
  if (field.metadata?.primitiveItems === true && field.fields.length === 1) return clone(field.fields[0].defaultValue);
  return Object.fromEntries(field.fields.map((child) => [child.name, clone(child.defaultValue)]));
}

function finish<T>(schema: NormalizedFormSchema<T> | undefined, diagnostics: SchemaDiagnostic[], throwOnError = false): SchemaNormalizationResult<T> {
  const result = Object.freeze({ valid: Boolean(schema), schema, diagnostics: deepFreeze(diagnostics.slice()) });
  if (!schema && throwOnError) throw new SchemaNormalizationError(result.diagnostics);
  return result;
}

function migrateToCurrent(input: unknown, migrations: readonly SchemaMigration[], diagnostics: SchemaDiagnostic[]): unknown {
  if (!isRecord(input)) return input;
  let schema: unknown = clone(input);
  let version = readVersion(schema) ?? CURRENT_SCHEMA_VERSION;
  if (!Number.isInteger(version) || version < 0) {
    diagnostics.push(diag('SCHEMA_INVALID', 'schemaVersion', 'schemaVersion must be a non-negative integer.')); return schema;
  }
  if (version > CURRENT_SCHEMA_VERSION) {
    diagnostics.push(diag('SCHEMA_UNSUPPORTED_VERSION', 'schemaVersion', `Schema version ${version} is newer than supported version ${CURRENT_SCHEMA_VERSION}.`)); return schema;
  }
  const visited = new Set<number>();
  while (version < CURRENT_SCHEMA_VERSION) {
    if (visited.has(version)) { diagnostics.push(diag('SCHEMA_MIGRATION_MISSING', 'schemaVersion', `Schema migration loop detected at version ${version}.`)); return schema; }
    visited.add(version);
    const migration = migrations.find((item) => item.from === version && item.to > version);
    if (!migration) { diagnostics.push(diag('SCHEMA_MIGRATION_MISSING', 'schemaVersion', `No schema migration is registered from version ${version}.`)); return schema; }
    try { schema = migration.migrate(deepFreeze(clone(schema)) as Readonly<Record<string, unknown>>); }
    catch (error) {
      diagnostics.push(diag('SCHEMA_MIGRATION_MISSING', 'schemaVersion', `Schema migration from version ${version} failed: ${error instanceof Error ? error.message : String(error)}`)); return schema;
    }
    version = readVersion(schema) ?? migration.to;
    if (version !== migration.to) { diagnostics.push(diag('SCHEMA_MIGRATION_MISSING', 'schemaVersion', `Migration from version ${migration.from} must produce version ${migration.to}.`)); return schema; }
  }
  return schema;
}

function normalizeField<T>(field: FieldSchema<T>): NormalizedFieldSchema<T> {
  const { required: _deprecatedRequired, ...canonicalField } = field;
  const fields = (field.fields ?? []).map(normalizeField);
  const source = field.dataSource ? {
    ...field.dataSource, type: field.dataSource.type ?? inferSource(field.dataSource),
    method: field.dataSource.method ?? 'GET', params: { ...(field.dataSource.params ?? {}) },
    cache: field.dataSource.cache ?? false,
    options: field.dataSource.options ? [...field.dataSource.options] : field.dataSource.options,
  } : undefined;
  return deepFreeze({
    ...canonicalField, label: field.label ?? humanize(field.name),
    defaultValue: field.defaultValue !== undefined ? clone(field.defaultValue) : defaultValue(field.type, fields),
    hiddenValuePolicy: field.hiddenValuePolicy ?? 'preserve',
    dependsOn: [...new Set((field.dependsOn ?? []).map(normalizePath))],
    resetOnDependencyChange: field.resetOnDependencyChange ?? false,
    options: (field.options ?? []).map(normalizeOption), validation: { ...(field.validation ?? {}), ...(field.required !== undefined && field.validation?.required === undefined ? { required: field.required } : {}) }, fields, dataSource: source,
    visibleWhen: copyCondition(field.visibleWhen), disabledWhen: copyCondition(field.disabledWhen),
    requiredWhen: copyCondition(field.requiredWhen), readOnlyWhen: copyCondition(field.readOnlyWhen),
    config: field.config ? { ...field.config } : field.config, metadata: field.metadata ? { ...field.metadata } : field.metadata,
  }) as NormalizedFieldSchema<T>;
}
function normalizeOption(option: FieldOption): Readonly<FieldOption> { return deepFreeze({ ...option, children: option.children?.map(normalizeOption) }); }
function copyCondition(value: FieldCondition | undefined): FieldCondition | undefined {
  if (!value) return undefined;
  if ('field' in value) return { ...clone(value), field: normalizePath(value.field) };
  return { and: value.and?.map(copyCondition).filter((item): item is FieldCondition => Boolean(item)), or: value.or?.map(copyCondition).filter((item): item is FieldCondition => Boolean(item)), not: copyCondition(value.not) };
}
function defaultValue(type: string, fields: readonly NormalizedFieldSchema<unknown>[]): FieldValue | undefined {
  if (type === 'object') return Object.fromEntries(fields.map((field) => [field.name, clone(field.defaultValue)]));
  if (['array', 'multi-select', 'checkbox-group', 'toggle-button-group', 'tree-checkbox', 'multi-file'].includes(type)) return [];
  if (['checkbox', 'switch', 'toggle-button'].includes(type)) return false;
  if (type.endsWith('-range') || type === 'range-slider') return [null, null];
  if (['text', 'textarea', 'password', 'email', 'url', 'phone', 'otp', 'pin', 'mask'].includes(type)) return '';
  if (['number', 'integer', 'decimal', 'select', 'autocomplete', 'async-autocomplete', 'radio', 'radio-group', 'tree-select', 'date', 'time', 'datetime', 'month', 'year', 'currency', 'percentage', 'slider', 'rating', 'file', 'camera', 'signature', 'document-preview', 'hidden'].includes(type)) return null;
  return undefined;
}
function inferSource(source: DataSourceConfig): NonNullable<DataSourceConfig['type']> { return source.load ? 'function' : source.url ? 'url' : 'static'; }

function detectCycles(fields: readonly FieldSchema<unknown>[]): SchemaDiagnostic[] {
  const graph = new Map<string, readonly string[]>(); collect(fields, '', graph);
  const visiting = new Set<string>(); const visited = new Set<string>(); const stack: string[] = []; const output: SchemaDiagnostic[] = [];
  const visit = (path: string): void => {
    if (visited.has(path)) return;
    if (visiting.has(path)) {
      const cycle = [...stack.slice(stack.indexOf(path)), path];
      output.push({ code: 'DEPENDENCY_CYCLE', severity: 'error', path, message: `Dependency cycle detected: ${cycle.join(' -> ')}`, relatedPath: path, reference: path, details: { cycle } }); return;
    }
    visiting.add(path); stack.push(path);
    for (const dependency of graph.get(path) ?? []) if (graph.has(dependency)) visit(dependency);
    stack.pop(); visiting.delete(path); visited.add(path);
  };
  for (const path of graph.keys()) visit(path);
  return output;
}
function collect(fields: readonly FieldSchema<unknown>[], parent: string, graph: Map<string, readonly string[]>): void {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    graph.set(path, field.dependsOn ?? []); collect(field.fields ?? [], path, graph);
  }
}
function collectWarnings(fields: readonly FieldSchema<unknown>[], parent: string, diagnostics: SchemaDiagnostic[]): void {
  for (const field of fields) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    if (['select', 'multi-select', 'radio', 'radio-group'].includes(field.type) && !field.options?.length && !field.dataSource) diagnostics.push({ code: 'SELECT_WITHOUT_OPTIONS', severity: 'warning', path, message: 'Selection field has neither options nor a data source.' });
    if (field.type === 'hidden' && (field.validation?.required ?? field.required)) diagnostics.push({ code: 'HIDDEN_REQUIRED_FIELD', severity: 'warning', path, message: 'A permanently hidden field is required.' });
    if (field.required !== undefined) diagnostics.push({ code: 'DEPRECATED_PROPERTY', severity: 'warning', path: `${path}.required`, message: 'required is deprecated; use validation.required instead.', details: { property: 'required', replacement: 'validation.required', removal: '2.0.0' } });
    collectWarnings(field.fields ?? [], path, diagnostics);
  }
}
function diag(code: SchemaDiagnosticCode, path: string, message: string): SchemaDiagnostic { return { code, severity: 'error', path, message }; }
function humanize(name: string): string {
  const value = name.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : name;
}
function readVersion(value: unknown): number | undefined { return isRecord(value) && typeof value.schemaVersion === 'number' ? value.schemaVersion : undefined; }
function isFormSchema(value: unknown): value is FormSchema<unknown> { return isRecord(value) && typeof value.id === 'string' && value.id.trim().length > 0 && Array.isArray(value.fields); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function clone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value;
  const existing = seen.get(value);
  if (existing) return existing as T;
  const copy: unknown = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  for (const [key, nested] of Object.entries(value)) (copy as Record<string, unknown>)[key] = clone(nested, seen);
  return copy as T;
}
function mergeValues(defaults: unknown, explicit: unknown): unknown {
  if (!isRecord(defaults) || !isRecord(explicit)) return explicit === undefined ? clone(defaults) : clone(explicit);
  const output: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(defaults), ...Object.keys(explicit)])) output[key] = key in explicit ? mergeValues(defaults[key], explicit[key]) : clone(defaults[key]);
  return output;
}
function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value); for (const nested of Object.values(value)) deepFreeze(nested, seen); return Object.freeze(value);
}
