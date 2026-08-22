import type { FieldSchema } from '@dynamic-forms/core';
export type ControlFamily = 'Input' | 'Selection' | 'Date/time' | 'Numeric' | 'File/media' | 'Nested';
export type ControlStatus = 'stable' | 'beta' | 'experimental';
export interface ControlCatalogItem { type: string; family: ControlFamily; status: ControlStatus; valueType: string; advanced?: boolean; asyncStates?: boolean; registered: boolean; }
const entries: Array<[ControlFamily, string[], string]> = [
  ['Input', ['text','textarea','password','email','url','hidden','phone','otp','pin','mask'], 'string | undefined'],
  ['Selection', ['select','autocomplete','async-autocomplete','radio','radio-group','toggle-button-group','tree-select'], 'string | number | boolean | undefined'],
  ['Selection', ['multi-select','checkbox-group'], 'Array<string | number | boolean>'],
  ['Selection', ['checkbox','switch'], 'boolean'],
  ['Date/time', ['date','time','datetime','month'], 'string | undefined'],
  ['Date/time', ['date-range','time-range','datetime-range'], 'readonly [string | undefined, string | undefined]'],
  ['Date/time', ['year'], 'number | undefined'],
  ['Numeric', ['number','integer','decimal','currency','percentage','slider','rating'], 'number | undefined'],
  ['Numeric', ['range-slider'], 'readonly [number, number]'],
  ['File/media', ['file','camera'], 'File | existing file | undefined'],
  ['File/media', ['multi-file'], 'Array<File | existing file>'],
  ['File/media', ['signature'], 'signature data | undefined'],
  ['File/media', ['document-preview'], 'existing file | URL | undefined'],
];
export const controlCatalog: readonly ControlCatalogItem[] = [
  ...entries.flatMap(([family, types, valueType]) => types.map((type) => ({ type, family, valueType, status: 'stable' as const, registered: true, advanced: ['autocomplete','async-autocomplete','multi-select','tree-select','range-slider','signature','camera'].includes(type), asyncStates: ['async-autocomplete','select','autocomplete','tree-select','file','multi-file','camera'].includes(type) }))),
  ...['toggle-button','tree-checkbox','object','array'].map((type) => ({ type, family: 'Nested' as const, valueType: type === 'array' ? 'unknown[]' : 'unknown', status: 'experimental' as const, registered: false })),
];
const choices = [{ label: 'Alpha', value: 'alpha' }, { label: 'Beta', value: 'beta' }, { label: 'Gamma', value: 'gamma' }];
export function createCatalogField(type: string, overrides: Partial<FieldSchema> = {}): FieldSchema {
  const field: FieldSchema = { name: `catalog_${type.replace(/-/g, '_')}`, type, label: type.split('-').map((word) => word[0].toUpperCase()+word.slice(1)).join(' '), description: `Live ${type} catalogue preview.` };
  if (['select','multi-select','autocomplete','checkbox-group','radio','radio-group','toggle-button-group'].includes(type)) field.options = choices;
  if (type === 'tree-select') field.options = [{ label: 'Parent', value: 'parent', children: [{ label: 'Child', value: 'child' }] }];
  if (type === 'async-autocomplete') field.dataSource = { type: 'static', options: choices };
  if (type === 'mask') field.config = { mask: '000-AAA' };
  if (type === 'currency') field.config = { currency: 'INR', locale: 'en-IN', min: 0 };
  if (['percentage','slider','range-slider','rating','number','integer','decimal','year'].includes(type)) field.config = { min: 0, max: type === 'percentage' ? 100 : 10, step: 1 };
  if (['file','multi-file','camera'].includes(type)) field.config = { accept: 'image/*,.pdf', maxFileSize: 5_000_000, maxFiles: 3, imagePreview: true };
  return { ...field, ...overrides };
}
export function defaultCatalogValue(type: string): unknown {
  if (['checkbox','switch'].includes(type)) return false;
  if (['multi-select','checkbox-group','multi-file'].includes(type)) return [];
  if (['range-slider'].includes(type)) return [2, 8];
  if (['date-range','time-range','datetime-range'].includes(type)) return ['', ''];
  if (['slider','rating'].includes(type)) return 3;
  return undefined;
}
