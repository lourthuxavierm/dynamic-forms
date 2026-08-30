import type { FieldSchema, FieldType, FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export type FieldLocation = { field: FieldSchema; parentPath: string; index: number };
export const structural = (field: FieldSchema) => field.type === 'object' || field.type === 'array';
export const splitPath = (path: string) => path.split('.').filter(Boolean);

export function findField(schema: FormSchema, path: string): FieldLocation | undefined {
  const names = splitPath(path); let fields = schema.fields; let parentPath = '';
  for (let depth = 0; depth < names.length; depth++) {
    const index = fields.findIndex((field) => field.name === names[depth]);
    if (index < 0) return undefined;
    const field = fields[index];
    if (depth === names.length - 1) return { field, parentPath, index };
    parentPath = parentPath ? `${parentPath}.${field.name}` : field.name;
    fields = field.fields ?? [];
  }
}

export function fieldsAt(schema: FormSchema, parentPath = ''): readonly FieldSchema[] {
  return parentPath ? findField(schema, parentPath)?.field.fields ?? [] : schema.fields;
}

function replaceChildren(schema: FormSchema, parentPath: string, children: readonly FieldSchema[]): FormSchema {
  if (!parentPath) return { ...schema, fields: children };
  return updateField(schema, parentPath, { fields: children });
}

export function updateField(schema: FormSchema, path: string, patch: Partial<FieldSchema>): FormSchema {
  const names = splitPath(path);
  const walk = (fields: readonly FieldSchema[], depth: number): readonly FieldSchema[] => fields.map((field) => {
    if (field.name !== names[depth]) return field;
    if (depth === names.length - 1) return { ...field, ...patch };
    return { ...field, fields: walk(field.fields ?? [], depth + 1) };
  });
  return { ...schema, fields: walk(schema.fields, 0) };
}

export function uniqueName(schema: FormSchema, parentPath: string, base: string): string {
  const safe = base.replace(/[^a-zA-Z0-9]+(.)?/g, (_, char: string | undefined) => char?.toUpperCase() ?? '').replace(/^[A-Z]/, (char) => char.toLowerCase()) || 'field';
  const names = new Set(fieldsAt(schema, parentPath).map((field) => field.name));
  if (!names.has(safe)) return safe;
  let suffix = 2; while (names.has(`${safe}${suffix}`)) suffix++;
  return `${safe}${suffix}`;
}

export function insertField(schema: FormSchema, parentPath: string, field: FieldSchema, index?: number): FormSchema {
  if (parentPath && !structural(findField(schema, parentPath)?.field ?? field)) return schema;
  const fields = [...fieldsAt(schema, parentPath)];
  fields.splice(index ?? fields.length, 0, field);
  return replaceChildren(schema, parentPath, fields);
}

export function removeField(schema: FormSchema, path: string): FormSchema {
  const location = findField(schema, path); if (!location) return schema;
  return replaceChildren(schema, location.parentPath, fieldsAt(schema, location.parentPath).filter((_, index) => index !== location.index));
}

export function moveField(schema: FormSchema, path: string, destination: number): FormSchema {
  const location = findField(schema, path); if (!location) return schema;
  const fields = [...fieldsAt(schema, location.parentPath)];
  if (destination < 0 || destination >= fields.length || destination === location.index) return schema;
  const [field] = fields.splice(location.index, 1); fields.splice(destination, 0, field);
  return replaceChildren(schema, location.parentPath, fields);
}

export function moveToParent(schema: FormSchema, path: string, parentPath: string): { schema: FormSchema; path: string } {
  const location = findField(schema, path); const parent = parentPath ? findField(schema, parentPath)?.field : undefined;
  if (!location || (parent && !structural(parent)) || parentPath === path || parentPath.startsWith(`${path}.`)) return { schema, path };
  let next = removeField(schema, path);
  const name = uniqueName(next, parentPath, location.field.name);
  next = insertField(next, parentPath, { ...location.field, name });
  return { schema: next, path: parentPath ? `${parentPath}.${name}` : name };
}

export function duplicateField(schema: FormSchema, path: string): { schema: FormSchema; path: string } {
  const location = findField(schema, path); if (!location) return { schema, path };
  const name = uniqueName(schema, location.parentPath, location.field.name);
  const copy = typeof structuredClone === 'function' ? structuredClone(location.field) : JSON.parse(JSON.stringify(location.field)) as FieldSchema;
  const next = insertField(schema, location.parentPath, { ...copy, name, label: `${copy.label ?? copy.name} copy` }, location.index + 1);
  return { schema: next, path: location.parentPath ? `${location.parentPath}.${name}` : name };
}

const optionTypes = new Set(['select','multi-select','autocomplete','checkbox-group','radio','radio-group','toggle-button-group','tree-select','tree-checkbox']);
const numericTypes = new Set(['number','integer','decimal','currency','percentage','slider','range-slider','rating','year']);
export function normalizeType(field: FieldSchema, type: FieldType | string): FieldSchema {
  const next: FieldSchema = { name: field.name, type, label: field.label, description: field.description, placeholder: field.placeholder, disabled: field.disabled, readOnly: field.readOnly, metadata: field.metadata };
  if (optionTypes.has(type)) next.options = field.options ?? [{ label: 'Option one', value: 'one' }];
  if (type === 'object' || type === 'array') next.fields = field.fields?.length ? field.fields : [{ name: 'field', type: 'text', label: 'Field' }];
  if (field.validation) {
    const { required, minLength, maxLength, pattern, min, max, multipleOf, minItems, maxItems, uniqueItems } = field.validation;
    next.validation = { required };
    if (['text','textarea','password','email','url','phone','mask'].includes(type)) Object.assign(next.validation, { minLength, maxLength, pattern });
    if (numericTypes.has(type)) Object.assign(next.validation, { min, max, multipleOf });
    if (type === 'array' || type === 'multi-select' || type === 'checkbox-group') Object.assign(next.validation, { minItems, maxItems, uniqueItems });
  }
  return next;
}

export function allPaths(schema: FormSchema): string[] {
  const output: string[] = [];
  const walk = (fields: readonly FieldSchema[], parent = '') => fields.forEach((field) => { const path = parent ? `${parent}.${field.name}` : field.name; output.push(path); walk(field.fields ?? [], path); });
  walk(schema.fields); return output;
}
