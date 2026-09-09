import type { FieldCondition } from '../conditions';
import type { DataSourceConfig } from '../datasource';

export type FieldType =
  // Core inputs
  | 'text'
  | 'textarea'
  | 'password'
  | 'email'
  | 'url'
  | 'number'
  | 'integer'
  | 'decimal'
  | 'hidden'

  // Selection
  | 'select'
  | 'multi-select'
  | 'autocomplete'
  | 'async-autocomplete'
  | 'checkbox'
  | 'checkbox-group'
  | 'radio'
  | 'radio-group'
  | 'switch'
  | 'toggle-button'
  | 'toggle-button-group'
  | 'tree-select'
  | 'tree-checkbox'

  // Date & Time
  | 'date'
  | 'time'
  | 'datetime'
  | 'date-range'
  | 'time-range'
  | 'datetime-range'
  | 'month'
  | 'year'

  // Specialized
  | 'currency'
  | 'percentage'
  | 'slider'
  | 'range-slider'
  | 'rating'
  | 'phone'
  | 'otp'
  | 'pin'
  | 'mask'
  | 'file'
  | 'multi-file'
  | 'camera'
  | 'signature'
  | 'document-preview'

  // Structural
  | 'object'
  | 'array';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  group?: string;
  children?: readonly FieldOption[];
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  // New constraints
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}


export interface TextFieldConfig {
  multiline?: boolean;
  rows?: number;
}

export interface NumericFieldConfig {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

export interface CurrencyFieldConfig extends NumericFieldConfig {
  currency?: string;
  locale?: string;
}

export interface ChoiceFieldConfig {
  multiple?: boolean;
  searchable?: boolean;
  debounceMs?: number;
  clearOnDependencyChange?: boolean;
}

export interface DateTimeFieldConfig {
  minDate?: string;
  maxDate?: string;
  step?: number;
}

export interface MaskFieldConfig {
  mask?: string;
  length?: number;
  placeholderCharacter?: string;
}

/** Framework-neutral configuration for OTP and PIN controls. */
export interface SegmentedFieldConfig {
  length?: number;
  numeric?: boolean;
  autoComplete?: string;
}

/** Framework-neutral configuration for year controls. */
export interface YearFieldConfig extends NumericFieldConfig {
  /** When omitted, native numeric input behavior is used. */
  inputMode?: 'numeric' | 'select';
}

/** Framework-neutral configuration for range values. */
export interface RangeFieldConfig extends NumericFieldConfig {
  minDistance?: number;
}

/** Framework-neutral constraints for array structural fields. */
export interface ArrayFieldConfig {
  minItems?: number;
  maxItems?: number;
  allowDuplicate?: boolean;
  allowReorder?: boolean;
}

export interface FileFieldConfig {
  /** Comma-separated MIME types or extensions, matching the HTML accept attribute. */
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
  imagePreview?: boolean;
}

export type FieldConfig =
  | TextFieldConfig
  | NumericFieldConfig
  | CurrencyFieldConfig
  | ChoiceFieldConfig
  | DateTimeFieldConfig
  | MaskFieldConfig
  | SegmentedFieldConfig
  | YearFieldConfig
  | RangeFieldConfig
  | ArrayFieldConfig
  | FileFieldConfig
  | Record<string, unknown>;
export interface FieldSchema<TCustomValue = never> {
  name: string;
  type: FieldType | string;
  label?: string;
  defaultValue?: FieldValue | TCustomValue;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  readOnly?: boolean;
  visibleWhen?: FieldCondition;
  disabledWhen?: FieldCondition;
  requiredWhen?: FieldCondition;
  readOnlyWhen?: FieldCondition;
  /** Controls what happens to a value while its field is conditionally hidden. */
  hiddenValuePolicy?: 'preserve' | 'clear' | 'reset';
  dependsOn?: readonly string[];
  resetOnDependencyChange?: boolean;
  dataSource?: DataSourceConfig;
  options?: readonly FieldOption[];
  config?: FieldConfig;
  validation?: FieldValidation;
  /**
   * Child fields for 'object' or 'array' types.
   */
  fields?: readonly FieldSchema<TCustomValue>[];
  /**
   * Custom metadata for the field.
   */
  metadata?: Record<string, unknown>;
}

export interface FormSchema<TCustomValue = never> {
  id: string;
  fields: readonly FieldSchema<TCustomValue>[];
  /** Structural format version used by Core migrations. Defaults to the current version. */
  schemaVersion?: number;
  /** Consumer-defined form release label. */
  version?: string;
}

export type FieldOptionValue = string | number | boolean;

/** Framework-neutral representation of an uploaded file. */
export interface FieldFileValue {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  data?: unknown;
}

/** Value contract for every built-in field type. Extend through FieldValue's second generic. */
export interface FieldValueMap {
  text: string;
  textarea: string;
  password: string;
  email: string;
  url: string;
  number: number | null;
  integer: number | null;
  decimal: number | null;
  hidden: string | number | boolean | null;
  select: FieldOptionValue | null;
  'multi-select': FieldOptionValue[];
  autocomplete: FieldOptionValue | null;
  'async-autocomplete': FieldOptionValue | null;
  checkbox: boolean;
  'checkbox-group': FieldOptionValue[];
  radio: FieldOptionValue | null;
  'radio-group': FieldOptionValue | null;
  switch: boolean;
  'toggle-button': boolean;
  'toggle-button-group': FieldOptionValue[];
  'tree-select': FieldOptionValue | null;
  'tree-checkbox': FieldOptionValue[];
  date: string | null;
  time: string | null;
  datetime: string | null;
  'date-range': readonly [string | null, string | null];
  'time-range': readonly [string | null, string | null];
  'datetime-range': readonly [string | null, string | null];
  month: string | null;
  year: number | null;
  currency: number | null;
  percentage: number | null;
  slider: number | null;
  'range-slider': readonly [number | null, number | null];
  rating: number | null;
  phone: string;
  otp: string;
  pin: string;
  mask: string;
  file: FieldFileValue | null;
  'multi-file': FieldFileValue[];
  camera: FieldFileValue | null;
  signature: string | null;
  'document-preview': string | null;
  object: Record<string, unknown>;
  array: unknown[];
}

export type FieldValue<
  TType extends string = keyof FieldValueMap,
  TCustomValues extends Record<string, unknown> = Record<never, never>,
> = TType extends keyof TCustomValues
  ? TCustomValues[TType]
  : TType extends keyof FieldValueMap
    ? FieldValueMap[TType]
    : unknown;

/** Infer form values from a const schema while retaining custom field-map support. */
export type InferSchemaType<
  T extends FormSchema<unknown> | readonly FieldSchema<unknown>[],
  TCustomValues extends Record<string, unknown> = Record<never, never>,
> = T extends FormSchema<unknown>
  ? InferFieldsType<T['fields'], TCustomValues>
  : T extends readonly FieldSchema<unknown>[]
    ? InferFieldsType<T, TCustomValues>
    : never;

type InferFieldsType<
  T extends readonly FieldSchema<unknown>[],
  TCustomValues extends Record<string, unknown>,
> = {
  [K in T[number] as K['name']]: InferFieldType<K, TCustomValues>;
};

type InferFieldType<
  T extends FieldSchema<unknown>,
  TCustomValues extends Record<string, unknown>,
> = T['type'] extends 'object'
  ? T['fields'] extends readonly FieldSchema<unknown>[]
    ? InferFieldsType<T['fields'], TCustomValues>
    : FieldValueMap['object']
  : T['type'] extends 'array'
    ? T['fields'] extends readonly FieldSchema<unknown>[]
      ? InferFieldsType<T['fields'], TCustomValues>[]
      : FieldValueMap['array']
    : FieldValue<Extract<T['type'], string>, TCustomValues>;
