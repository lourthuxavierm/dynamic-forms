import type { FieldSchema, FieldType } from '@dynamic-form-engine/core';
export interface PaletteItem { type: FieldType; label: string; group: string }
const groups: Record<string, readonly FieldType[]> = {
  Text: ['text','textarea','password','email','url','hidden'],
  Choice: ['select','multi-select','autocomplete','async-autocomplete','checkbox','checkbox-group','radio','radio-group','switch','toggle-button','toggle-button-group','tree-select','tree-checkbox'],
  'Date & time': ['date','time','datetime','date-range','time-range','datetime-range','month','year'],
  Specialized: ['currency','percentage','slider','range-slider','rating','phone','otp','pin','mask','file','multi-file','camera','signature','document-preview'],
  Structure: ['object','array'],
  Numeric: ['number','integer','decimal'],
};
const title = (type: string) => type.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
export const palette: readonly PaletteItem[] = Object.entries(groups).flatMap(([group, types]) => types.map((type) => ({ type, label: title(type), group })));
const optionTypes = new Set(['select','multi-select','autocomplete','async-autocomplete','checkbox-group','radio','radio-group','toggle-button-group','tree-select','tree-checkbox']);
export function createField(type: FieldType, name: string): FieldSchema {
  const field: FieldSchema = { name, type, label: title(type) };
  if (optionTypes.has(type)) field.options = [{ label: 'Option one', value: 'one' }, { label: 'Option two', value: 'two' }];
  if (type === 'object' || type === 'array') field.fields = [{ name: 'field', type: 'text', label: 'Field' }];
  return field;
}
export const hasOptions = (type: string) => optionTypes.has(type);
export const isNumeric = (type: string) => ['number','integer','decimal','currency','percentage','slider','range-slider','rating','year'].includes(type);
export const isTextual = (type: string) => ['text','textarea','password','email','url','phone','mask','otp','pin'].includes(type);
