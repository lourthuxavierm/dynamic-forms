import type { FieldCondition } from '../conditions';
import type { DataSourceConfig } from '../datasource';
import type { FieldSchema, FormSchema } from './types';

export interface SchemaValidationError { path: string; message: string; }
export interface SchemaValidationResult { valid: boolean; errors: SchemaValidationError[]; }

export function validateSchema(schema: FormSchema): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const fields = new Map<string, FieldSchema>();
  collect(schema.fields, '', fields, errors);
  for (const [path, field] of fields) validateField(field, path, fields, errors);
  return { valid: errors.length === 0, errors };
}

function collect(items: readonly FieldSchema[], parent: string, all: Map<string, FieldSchema>, errors: SchemaValidationError[]): void {
  const siblingNames = new Set<string>();
  for (const field of items) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    if (!field.name.trim()) errors.push({ path, message: 'Field name must not be empty' });
    if (/[.\[\]]/.test(field.name)) errors.push({ path, message: 'Field name must not contain path separators' });
    if (siblingNames.has(field.name)) errors.push({ path, message: `Duplicate field name: ${field.name}` });
    siblingNames.add(field.name);
    all.set(path, field);
    if (field.fields) collect(field.fields, path, all, errors);
  }
}

function validateField(field: FieldSchema, path: string, all: Map<string, FieldSchema>, errors: SchemaValidationError[]): void {
  const structural = field.type === 'object' || field.type === 'array';
  if (field.fields && !structural) errors.push({ path, message: 'Only object and array fields may define child fields' });
  if (structural && (!field.fields || field.fields.length === 0)) errors.push({ path, message: `${field.type} fields must define at least one child field` });
  validateRules(field, path, errors);
  validateOptions(field, path, errors);
  validateReferences(field, path, all, errors);
  validateDataSource(field.dataSource, path, errors);
}

function validateRules(field: FieldSchema, path: string, errors: SchemaValidationError[]): void {
  const rules = field.validation;
  if (!rules) return;
  if (rules.minLength !== undefined && rules.maxLength !== undefined && rules.minLength > rules.maxLength) errors.push({ path, message: 'minLength must not exceed maxLength' });
  if (rules.min !== undefined && rules.max !== undefined && rules.min > rules.max) errors.push({ path, message: 'min must not exceed max' });
  if (rules.minItems !== undefined && rules.maxItems !== undefined && rules.minItems > rules.maxItems) errors.push({ path, message: 'minItems must not exceed maxItems' });
  if (rules.multipleOf !== undefined && rules.multipleOf <= 0) errors.push({ path, message: 'multipleOf must be greater than zero' });
  if (rules.pattern) try { new RegExp(rules.pattern); } catch { errors.push({ path, message: 'pattern must be a valid regular expression' }); }
}

function validateOptions(field: FieldSchema, path: string, errors: SchemaValidationError[]): void {
  const values = new Set<string>();
  for (const option of field.options ?? []) {
    const key = String(option.value);
    if (values.has(key)) errors.push({ path, message: `Duplicate option value: ${key}` });
    values.add(key);
  }
}

function validateReferences(field: FieldSchema, path: string, all: Map<string, FieldSchema>, errors: SchemaValidationError[]): void {
  for (const condition of [field.visibleWhen, field.disabledWhen, field.requiredWhen, field.readOnlyWhen]) validateCondition(condition, path, all, errors);
  for (const dependency of field.dependsOn ?? []) {
    if (!all.has(dependency)) errors.push({ path, message: `Unknown dependency field: ${dependency}` });
    if (dependency === path) errors.push({ path, message: 'A field cannot depend on itself' });
  }
}

function validateCondition(condition: FieldCondition | undefined, path: string, all: Map<string, FieldSchema>, errors: SchemaValidationError[]): void {
  if (!condition) return;
  if ('field' in condition) {
    if (!all.has(condition.field)) errors.push({ path, message: `Unknown condition field: ${condition.field}` });
    return;
  }
  for (const nested of condition.and ?? []) validateCondition(nested, path, all, errors);
  for (const nested of condition.or ?? []) validateCondition(nested, path, all, errors);
  validateCondition(condition.not, path, all, errors);
}

function validateDataSource(source: DataSourceConfig | undefined, path: string, errors: SchemaValidationError[]): void {
  if (!source) return;
  if (source.type === 'function' && typeof source.load !== 'function') errors.push({ path, message: 'Function data sources require a load function' });
  if (source.type === 'static' && !Array.isArray(source.options)) errors.push({ path, message: 'Static data sources require options' });
  if (source.type === 'url' && !source.url?.trim()) errors.push({ path, message: 'URL data sources require a URL' });
}
