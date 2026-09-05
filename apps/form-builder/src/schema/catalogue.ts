import type { FieldSchema, FieldType } from '@dynamic-form-engine/core';

export type PaletteAccent = 'blue' | 'violet' | 'teal' | 'amber' | 'pink' | 'slate';

export interface PaletteItem {
  type: FieldType;
  label: string;
  group: PaletteGroupName;
  icon: string;
  accent: PaletteAccent;
  keywords?: readonly string[];
}

export type PaletteGroupName = 'Basic Inputs' | 'Selection' | 'Date & Time' | 'Advanced' | 'Structure' | 'Layout & Utilities';

const definitions: ReadonlyArray<readonly [PaletteGroupName, PaletteAccent, readonly FieldType[]]> = [
  ['Basic Inputs', 'blue', ['text','textarea','number','integer','decimal','email','password','url','phone','hidden']],
  ['Selection', 'violet', ['select','multi-select','autocomplete','async-autocomplete','checkbox','checkbox-group','radio','radio-group','switch','toggle-button','toggle-button-group','tree-select','tree-checkbox']],
  ['Date & Time', 'teal', ['date','time','datetime','date-range','time-range','datetime-range','month','year']],
  ['Advanced', 'amber', ['currency','percentage','slider','range-slider','rating','otp','pin','mask','file','multi-file','camera','signature','document-preview']],
  ['Structure', 'pink', ['object','array']],
];

export const paletteGroups: readonly PaletteGroupName[] = [...definitions.map(([group]) => group), 'Layout & Utilities'];

const icons: Partial<Record<FieldType, string>> = {
  text: 'T', textarea: '▤', number: '13', integer: '#', decimal: '.0', email: '@', password: '▣', url: '↗', phone: '☎', hidden: '◉',
  select: '≡', 'multi-select': '▦', autocomplete: '⌕', 'async-autocomplete': '⌁', checkbox: '☑', 'checkbox-group': '☷',
  radio: '◉', 'radio-group': '◎', switch: '◐', 'toggle-button': '◍', 'toggle-button-group': '◫', 'tree-select': '⌘', 'tree-checkbox': '⌗',
  date: '□', time: '◷', datetime: '▣', 'date-range': '⇔', 'time-range': '↔', 'datetime-range': '⟷', month: 'M', year: 'Y',
  currency: '$', percentage: '%', slider: '↹', 'range-slider': '↔', rating: '☆', otp: '••', pin: '⁙', mask: '※',
  file: '⇧', 'multi-file': '⇈', camera: '▣', signature: '✎', 'document-preview': '▧', object: '{}', array: '[]',
};

const title = (type: string) => type.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');

export const palette: readonly PaletteItem[] = definitions.flatMap(([group, accent, types]) =>
  types.map((type) => ({ type, label: title(type), group, accent, icon: icons[type] ?? type.slice(0, 2).toUpperCase() })),
);

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

