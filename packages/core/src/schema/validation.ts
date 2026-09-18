import type { FieldCondition } from '../conditions';
import type { DataSourceConfig } from '../datasource';
import { normalizePath, parsePath } from '../store';
import type { FieldOption, FieldSchema, FormSchema } from './types';

export type SchemaValidationCode =
  | 'FIELD_NAME_EMPTY' | 'FIELD_NAME_INVALID' | 'FIELD_DUPLICATE'
  | 'FIELD_ID_EMPTY' | 'FIELD_ID_INVALID' | 'FIELD_ID_DUPLICATE'
  | 'FIELD_CHILDREN_NOT_ALLOWED' | 'FIELD_CHILDREN_REQUIRED'
  | 'VALIDATION_RANGE_INVALID' | 'VALIDATION_MULTIPLE_INVALID' | 'VALIDATION_PATTERN_INVALID'
  | 'OPTION_DUPLICATE_VALUE' | 'CONDITION_REFERENCE_NOT_FOUND'
  | 'DEPENDENCY_REFERENCE_NOT_FOUND' | 'DEPENDENCY_SELF_REFERENCE'
  | 'DATASOURCE_INVALID' | 'DATASOURCE_PARAMETER_REFERENCE_NOT_FOUND'
  | 'FIELD_REFERENCE_INVALID' | 'FIELD_REFERENCE_INDEX_NOT_SUPPORTED'
  | 'ARRAY_ITEM_BEHAVIOR_NOT_SUPPORTED'
  | 'FIELD_CONFIG_INVALID'
  | 'DEFAULT_VALUE_TYPE_MISMATCH' | 'DEFAULT_VALUE_UNKNOWN_KEY';
export interface SchemaValidationError {
  code: SchemaValidationCode;
  path: string;
  message: string;
  relatedPath?: string;
  details?: Readonly<Record<string, unknown>>;
}
export interface SchemaValidationResult { valid: boolean; errors: SchemaValidationError[]; }

export function validateSchema(schema: FormSchema<unknown>): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  const fields = new Map<string, FieldSchema<unknown>>();
  collect(schema.fields, '', fields, new Map(), errors);
  for (const [path, field] of fields) validateField(field, path, fields, errors);
  return { valid: errors.length === 0, errors };
}
function collect(items: readonly FieldSchema<unknown>[], parent: string, all: Map<string, FieldSchema<unknown>>, ids: Map<string, string>, errors: SchemaValidationError[]): void {
  const siblings = new Set<string>();
  for (const field of items) {
    const path = parent ? `${parent}.${field.name}` : field.name;
    if (!field.name.trim()) add(errors, 'FIELD_NAME_EMPTY', path, 'Field name must not be empty');
    if (/[.\[\]]/.test(field.name)) add(errors, 'FIELD_NAME_INVALID', path, 'Field name must not contain path separators');
    if (siblings.has(field.name)) add(errors, 'FIELD_DUPLICATE', path, `Duplicate field name: ${field.name}`, path);
    if (field.id !== undefined) {
      if (!field.id.trim()) add(errors, 'FIELD_ID_EMPTY', path, 'Field id must not be empty', undefined, { id: field.id });
      else if (field.id !== field.id.trim()) add(errors, 'FIELD_ID_INVALID', path, 'Field id must not contain leading or trailing whitespace', undefined, { id: field.id });
      else if (ids.has(field.id)) add(errors, 'FIELD_ID_DUPLICATE', path, `Duplicate field id: ${field.id}`, ids.get(field.id), { id: field.id });
      else ids.set(field.id, path);
    }
    siblings.add(field.name); all.set(path, field);
    if (field.fields) collect(field.fields, path, all, ids, errors);
  }
}
function validateField(field: FieldSchema<unknown>, path: string, all: Map<string, FieldSchema<unknown>>, errors: SchemaValidationError[]): void {
  const structural = field.type === 'object' || field.type === 'array';
  if (field.fields && !structural) add(errors, 'FIELD_CHILDREN_NOT_ALLOWED', path, 'Only object and array fields may define child fields');
  if (structural && (!field.fields || !field.fields.length)) add(errors, 'FIELD_CHILDREN_REQUIRED', path, `${field.type} fields must define at least one child field`);
  if (isArrayDescendant(all, path) && hasRuntimeReferenceBehavior(field)) add(errors, 'ARRAY_ITEM_BEHAVIOR_NOT_SUPPORTED', path, 'Conditions, dependencies, and data sources on array item fields require runtime item compilation and are not supported in persisted schemas');
  validateDefaultValue(field, path, errors);
  validateRules(field, path, errors); validateOptions(field, path, errors); validateReferences(field, path, all, errors); validateDataSource(field.dataSource, path, all, errors); validateConfig(field, path, errors);
}
function validateRules(field: FieldSchema<unknown>, path: string, errors: SchemaValidationError[]): void {
  const rules = field.validation; if (!rules) return;
  if (rules.minLength !== undefined && rules.maxLength !== undefined && rules.minLength > rules.maxLength) add(errors, 'VALIDATION_RANGE_INVALID', path, 'minLength must not exceed maxLength', undefined, { minLength: rules.minLength, maxLength: rules.maxLength });
  if (rules.min !== undefined && rules.max !== undefined && rules.min > rules.max) add(errors, 'VALIDATION_RANGE_INVALID', path, 'min must not exceed max', undefined, { min: rules.min, max: rules.max });
  if (rules.minItems !== undefined && rules.maxItems !== undefined && rules.minItems > rules.maxItems) add(errors, 'VALIDATION_RANGE_INVALID', path, 'minItems must not exceed maxItems', undefined, { minItems: rules.minItems, maxItems: rules.maxItems });
  if (rules.multipleOf !== undefined && rules.multipleOf <= 0) add(errors, 'VALIDATION_MULTIPLE_INVALID', path, 'multipleOf must be greater than zero', undefined, { multipleOf: rules.multipleOf });
  if (rules.pattern) try { new RegExp(rules.pattern); } catch { add(errors, 'VALIDATION_PATTERN_INVALID', path, 'pattern must be a valid regular expression', undefined, { pattern: rules.pattern }); }
}
function validateOptions(field: FieldSchema<unknown>, path: string, errors: SchemaValidationError[]): void {
  validateOptionList(field.options ?? [], path, errors);
}
function validateOptionList(options: readonly FieldOption[], path: string, errors: SchemaValidationError[]): void {
  const values: Array<string | number | boolean> = [];
  for (const option of options) {
    if (values.some((value) => Object.is(value, option.value))) add(errors, 'OPTION_DUPLICATE_VALUE', path, `Duplicate option value: ${String(option.value)}`, undefined, { value: option.value });
    values.push(option.value);
    if (option.children) validateOptionList(option.children, path, errors);
  }
}
function validateDefaultValue(field: FieldSchema<unknown>, path: string, errors: SchemaValidationError[]): void {
  if (field.defaultValue === undefined) return;
  validateDefaultNode(field, field.defaultValue, path, errors);
}
function validateDefaultNode(field: FieldSchema<unknown>, value: unknown, path: string, errors: SchemaValidationError[]): void {
  const strings = ['text', 'textarea', 'password', 'email', 'url', 'phone', 'otp', 'pin', 'mask'];
  const numbers = ['number', 'integer', 'decimal', 'currency', 'percentage', 'slider', 'rating', 'year'];
  const booleans = ['checkbox', 'switch', 'toggle-button'];
  const collections = ['multi-select', 'checkbox-group', 'toggle-button-group', 'tree-checkbox'];
  let valid = true;
  if (strings.includes(field.type)) valid = typeof value === 'string';
  else if (numbers.includes(field.type)) valid = value === null || typeof value === 'number';
  else if (booleans.includes(field.type)) valid = typeof value === 'boolean';
  else if (collections.includes(field.type)) valid = Array.isArray(value) && value.every(isOptionValue);
  else if (field.type === 'array') valid = Array.isArray(value);
  else if (['date-range', 'time-range', 'datetime-range'].includes(field.type)) valid = isPair(value, (item) => item === null || typeof item === 'string');
  else if (field.type === 'range-slider') valid = isPair(value, (item) => item === null || typeof item === 'number');
  else if (field.type === 'object') valid = isRecord(value);
  else if (['select', 'autocomplete', 'async-autocomplete', 'radio', 'radio-group', 'tree-select'].includes(field.type)) valid = value === null || isOptionValue(value);
  else if (['date', 'time', 'datetime', 'month', 'signature', 'document-preview'].includes(field.type)) valid = value === null || typeof value === 'string';
  else if (field.type === 'hidden') valid = value === null || ['string', 'number', 'boolean'].includes(typeof value);
  else if (field.type === 'file' || field.type === 'camera') valid = value === null || isFileValue(value);
  else if (field.type === 'multi-file') valid = Array.isArray(value) && value.every(isFileValue);
  if (!valid) {
    add(errors, 'DEFAULT_VALUE_TYPE_MISMATCH', path, `Default value does not match field type: ${field.type}`, undefined, { fieldType: field.type, actualType: valueType(value) });
    return;
  }
  if (field.type === 'object' && isRecord(value)) validateObjectDefault(field.fields ?? [], value, path, errors);
  if (field.type === 'array' && Array.isArray(value)) validateArrayDefault(field, value, path, errors);
}
function validateObjectDefault(children: readonly FieldSchema<unknown>[], value: Readonly<Record<string, unknown>>, path: string, errors: SchemaValidationError[]): void {
  const fields = new Map(children.map((child) => [child.name, child]));
  for (const [key, nested] of Object.entries(value)) {
    const child = fields.get(key);
    const childPath = `${path}.${key}`;
    if (!child) {
      add(errors, 'DEFAULT_VALUE_UNKNOWN_KEY', childPath, `Default value contains an unknown field: ${key}`, undefined, { key });
      continue;
    }
    validateDefaultNode(child, nested, childPath, errors);
  }
}
function validateArrayDefault(field: FieldSchema<unknown>, value: readonly unknown[], path: string, errors: SchemaValidationError[]): void {
  const children = field.fields ?? [];
  if (field.metadata?.primitiveItems === true && children.length === 1) {
    value.forEach((item, index) => validateDefaultNode(children[0], item, `${path}.${index}`, errors));
    return;
  }
  value.forEach((item, index) => {
    const itemPath = `${path}.${index}`;
    if (!isRecord(item)) {
      add(errors, 'DEFAULT_VALUE_TYPE_MISMATCH', itemPath, 'Array item default must be an object matching the declared child fields', undefined, { fieldType: 'object', actualType: valueType(item) });
      return;
    }
    validateObjectDefault(children, item, itemPath, errors);
  });
}
function validateReferences(field: FieldSchema<unknown>, path: string, all: Map<string, FieldSchema<unknown>>, errors: SchemaValidationError[]): void {
  for (const condition of [field.visibleWhen, field.disabledWhen, field.requiredWhen, field.readOnlyWhen]) validateCondition(condition, path, all, errors);
  for (const dependency of field.dependsOn ?? []) {
    if (!validateReferencePath(dependency, path, all, errors)) continue;
    const canonical = normalizePath(dependency);
    if (!hasSchemaPath(all, canonical)) add(errors, 'DEPENDENCY_REFERENCE_NOT_FOUND', path, `Unknown dependency field: ${dependency}`, canonical);
    if (canonical === path) add(errors, 'DEPENDENCY_SELF_REFERENCE', path, 'A field cannot depend on itself', canonical);
  }
}
function hasSchemaPath(all: Map<string, FieldSchema<unknown>>, path: string): boolean { return all.has(path); }
function validateCondition(condition: FieldCondition | undefined, path: string, all: Map<string, FieldSchema<unknown>>, errors: SchemaValidationError[]): void {
  if (!condition) return;
  if ('field' in condition) {
    if (!validateReferencePath(condition.field, path, all, errors)) return;
    const canonical = normalizePath(condition.field);
    if (!hasSchemaPath(all, canonical)) add(errors, 'CONDITION_REFERENCE_NOT_FOUND', path, `Unknown condition field: ${condition.field}`, canonical);
    return;
  }
  for (const nested of condition.and ?? []) validateCondition(nested, path, all, errors);
  for (const nested of condition.or ?? []) validateCondition(nested, path, all, errors);
  validateCondition(condition.not, path, all, errors);
}
function validateDataSource(source: DataSourceConfig | undefined, path: string, all: Map<string, FieldSchema<unknown>>, errors: SchemaValidationError[]): void {
  if (!source) return;
  if (source.type === 'function' && typeof source.load !== 'function') add(errors, 'DATASOURCE_INVALID', path, 'Function data sources require a load function');
  if (source.type === 'static' && !Array.isArray(source.options)) add(errors, 'DATASOURCE_INVALID', path, 'Static data sources require options');
  if (source.type === 'url' && !source.url?.trim()) add(errors, 'DATASOURCE_INVALID', path, 'URL data sources require a URL');
  if ((source.pageParam && !source.pageSizeParam) || (!source.pageParam && source.pageSizeParam)) add(errors, 'DATASOURCE_INVALID', path, 'Pagination requires both pageParam and pageSizeParam');
  const parameterNames = [source.searchParam, source.pageParam, source.pageSizeParam].filter((value): value is string => value !== undefined);
  if (parameterNames.some((value) => !value.trim())) add(errors, 'DATASOURCE_INVALID', path, 'Data source parameter names must not be empty');
  if (new Set(parameterNames).size !== parameterNames.length) add(errors, 'DATASOURCE_INVALID', path, 'Search and pagination parameter names must be distinct');
  if (source.cacheKey !== undefined && !source.cache) add(errors, 'DATASOURCE_INVALID', path, 'cacheKey requires cache to be enabled');
  for (const reference of dataSourceReferences(source.params)) {
    if (!validateReferencePath(reference, path, all, errors)) continue;
    const canonical = normalizePath(reference);
    if (!hasSchemaPath(all, canonical)) add(errors, 'DATASOURCE_PARAMETER_REFERENCE_NOT_FOUND', path, `Unknown data source parameter field: ${reference}`, canonical);
  }
}
function validateConfig(field: FieldSchema<unknown>, path: string, errors: SchemaValidationError[]): void {
  const debounceMs = field.config && 'debounceMs' in field.config ? field.config.debounceMs : undefined;
  if (debounceMs !== undefined && (typeof debounceMs !== 'number' || !Number.isFinite(debounceMs) || debounceMs < 0)) add(errors, 'FIELD_CONFIG_INVALID', path, 'debounceMs must be a finite non-negative number', undefined, { debounceMs });
}
function dataSourceReferences(params: Readonly<Record<string, unknown>> | undefined): readonly string[] {
  const references = new Set<string>(); const visit = (value: unknown): void => { if (typeof value === 'string' && value.startsWith('$') && value.length > 1) references.add(value.slice(1)); if (isRecord(value) && typeof value.fromField === 'string') references.add(value.fromField); if (Array.isArray(value)) value.forEach(visit); else if (isRecord(value)) Object.values(value).forEach(visit); }; visit(params); return [...references];
}
function add(errors: SchemaValidationError[], code: SchemaValidationCode, path: string, message: string, relatedPath?: string, details?: Readonly<Record<string, unknown>>): void { errors.push({ code, path, message, relatedPath, details }); }
function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function isOptionValue(value: unknown): value is string | number | boolean { return ['string', 'number', 'boolean'].includes(typeof value); }
function isPair(value: unknown, accepts: (item: unknown) => boolean): boolean { return Array.isArray(value) && value.length === 2 && value.every(accepts); }
function isFileValue(value: unknown): boolean { return isRecord(value) && typeof value.name === 'string' && typeof value.size === 'number' && typeof value.type === 'string'; }
function valueType(value: unknown): string { return Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value; }
function validateReferencePath(reference: string, ownerPath: string, all: Map<string, FieldSchema<unknown>>, errors: SchemaValidationError[]): boolean {
  let segments: readonly string[];
  try { segments = parsePath(reference); }
  catch {
    add(errors, 'FIELD_REFERENCE_INVALID', ownerPath, `Invalid field reference path: ${reference}`, reference);
    return false;
  }
  if (!segments.length) {
    add(errors, 'FIELD_REFERENCE_INVALID', ownerPath, 'Field reference path must not be empty', reference);
    return false;
  }
  if (segments.some((segment) => /^\d+$/.test(segment))) {
    add(errors, 'FIELD_REFERENCE_INDEX_NOT_SUPPORTED', ownerPath, `Indexed array references are not supported in persisted schemas: ${reference}`, normalizePath(reference), { reference });
    return false;
  }
  const canonical = normalizePath(reference);
  if (isArrayDescendant(all, canonical)) {
    add(errors, 'FIELD_REFERENCE_INDEX_NOT_SUPPORTED', ownerPath, `Array item template references are ambiguous without a runtime index: ${reference}`, canonical, { reference });
    return false;
  }
  return true;
}
function isArrayDescendant(all: Map<string, FieldSchema<unknown>>, path: string): boolean {
  const segments = path.split('.');
  for (let index = 1; index < segments.length; index += 1) if (all.get(segments.slice(0, index).join('.'))?.type === 'array') return true;
  return false;
}
function hasRuntimeReferenceBehavior(field: FieldSchema<unknown>): boolean {
  return Boolean(field.visibleWhen || field.disabledWhen || field.requiredWhen || field.readOnlyWhen || field.dependsOn?.length || field.dataSource);
}
