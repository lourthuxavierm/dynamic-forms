import type { FieldSchema, FieldType } from '@dynamic-form-engine/core';
import {
  AlignLeft, Asterisk, Binary, Braces, Brackets, Calendar, CalendarClock, CalendarDays, CalendarRange, Camera, ChevronDown,
  CircleDot, Clock, DollarSign, EyeOff, FileText, Files, Hash, Hourglass, KeyRound, LayoutTemplate, Link, ListChecks,
  ListTodo, ListTree, Lock, Mail, Network, Percent, Phone, RectangleEllipsis, Regex, Rows3, Search, Sigma, Signature,
  SlidersHorizontal, SlidersVertical, Sparkles, SquareCheck, Star, TextCursorInput, TextSearch, ToggleLeft, ToggleRight,
  Type, Upload, Boxes, Columns3, type LucideIcon,
} from 'lucide-react';

export type PaletteAccent = 'green' | 'blue' | 'red' | 'orange' | 'violet' | 'teal' | 'pink' | 'slate';

export interface PaletteItem {
  type: FieldType;
  label: string;
  group: PaletteGroupName;
  icon: LucideIcon;
  accent: PaletteAccent;
  keywords?: readonly string[];
}

export type PaletteGroupName = 'Basic Inputs' | 'Selection' | 'Date & Time' | 'Advanced' | 'Structure' | 'Layout & Utilities';

const definitions: ReadonlyArray<readonly [PaletteGroupName, readonly FieldType[]]> = [
  ['Basic Inputs', ['text','textarea','number','integer','decimal','email','password','url','phone','hidden']],
  ['Selection', ['select','multi-select','autocomplete','async-autocomplete','checkbox','checkbox-group','radio','radio-group','switch','toggle-button','toggle-button-group','tree-select','tree-checkbox']],
  ['Date & Time', ['date','time','datetime','date-range','time-range','datetime-range','month','year']],
  ['Advanced', ['currency','percentage','slider','range-slider','rating','otp','pin','mask','file','multi-file','camera','signature','document-preview']],
  ['Structure', ['object','array']],
];

export const paletteGroups: readonly PaletteGroupName[] = [...definitions.map(([group]) => group), 'Layout & Utilities'];

export const groupIcons: Record<PaletteGroupName, LucideIcon> = {
  'Basic Inputs': TextCursorInput,
  Selection: ListChecks,
  'Date & Time': CalendarDays,
  Advanced: Sparkles,
  Structure: Boxes,
  'Layout & Utilities': LayoutTemplate,
};

const visuals: Partial<Record<FieldType, readonly [LucideIcon, PaletteAccent]>> = {
  text: [Type, 'green'], textarea: [AlignLeft, 'blue'], number: [Hash, 'red'], integer: [Binary, 'orange'], decimal: [Sigma, 'violet'],
  email: [Mail, 'blue'], password: [Lock, 'red'], url: [Link, 'green'], phone: [Phone, 'blue'], hidden: [EyeOff, 'slate'],
  select: [ChevronDown, 'violet'], 'multi-select': [ListTodo, 'violet'], autocomplete: [Search, 'blue'], 'async-autocomplete': [TextSearch, 'blue'],
  checkbox: [SquareCheck, 'green'], 'checkbox-group': [ListChecks, 'green'], radio: [CircleDot, 'orange'], 'radio-group': [Rows3, 'orange'],
  switch: [ToggleRight, 'teal'], 'toggle-button': [ToggleLeft, 'teal'], 'toggle-button-group': [Columns3, 'teal'], 'tree-select': [ListTree, 'pink'], 'tree-checkbox': [Network, 'pink'],
  date: [Calendar, 'teal'], time: [Clock, 'blue'], datetime: [CalendarClock, 'violet'], 'date-range': [CalendarRange, 'teal'], 'time-range': [Hourglass, 'blue'],
  'datetime-range': [CalendarRange, 'violet'], month: [CalendarDays, 'orange'], year: [Calendar, 'red'],
  currency: [DollarSign, 'green'], percentage: [Percent, 'orange'], slider: [SlidersHorizontal, 'blue'], 'range-slider': [SlidersVertical, 'blue'], rating: [Star, 'orange'],
  otp: [RectangleEllipsis, 'violet'], pin: [KeyRound, 'red'], mask: [Regex, 'slate'], file: [Upload, 'blue'], 'multi-file': [Files, 'blue'],
  camera: [Camera, 'pink'], signature: [Signature, 'violet'], 'document-preview': [FileText, 'slate'], object: [Braces, 'pink'], array: [Brackets, 'pink'],
};

const title = (type: string) => type.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');

export const palette: readonly PaletteItem[] = definitions.flatMap(([group, types]) =>
  types.map((type) => {
    const [icon, accent] = visuals[type] ?? [Asterisk, 'slate'] as const;
    return { type, label: title(type), group, icon, accent };
  }),
);

const byType = new Map(palette.map((item) => [item.type as string, item]));
export const paletteItem = (type: string): PaletteItem | undefined => byType.get(type);

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
