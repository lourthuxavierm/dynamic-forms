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
}

export interface CurrencyFieldConfig extends NumericFieldConfig {
  currency?: string;
  locale?: string;
}

export interface ChoiceFieldConfig {
  multiple?: boolean;
  searchable?: boolean;
}

export interface DateTimeFieldConfig {
  minDate?: string;
  maxDate?: string;
}

export interface MaskFieldConfig {
  mask?: string;
  length?: number;
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
  | FileFieldConfig
  | Record<string, unknown>;
export interface FieldSchema {
  name: string;
  type: FieldType | string;
  label?: string;
  defaultValue?: unknown;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  readOnly?: boolean;
  visibleWhen?: FieldCondition;
  disabledWhen?: FieldCondition;
  requiredWhen?: FieldCondition;
  readOnlyWhen?: FieldCondition;
  dependsOn?: readonly string[];
  resetOnDependencyChange?: boolean;
  dataSource?: DataSourceConfig;
  options?: readonly FieldOption[];
  config?: FieldConfig;
  validation?: FieldValidation;
  /**
   * Child fields for 'object' or 'array' types.
   */
  fields?: readonly FieldSchema[];
  /**
   * Custom metadata for the field.
   */
  metadata?: Record<string, unknown>;
}

export interface FormSchema {
  id: string;
  fields: readonly FieldSchema[];
  /**
   * Version of the schema.
   */
  version?: string;
}

export type FieldValue = any;

/**
 * Helper to infer the TypeScript type of form values from a schema.
 * Note: This is a simplified version and might need refinement for complex schemas.
 */
export type InferSchemaType<T extends FormSchema | readonly FieldSchema[]> = T extends FormSchema
  ? InferFieldsType<T['fields']>
  : T extends readonly FieldSchema[]
  ? InferFieldsType<T>
  : never;

type InferFieldsType<T extends readonly FieldSchema[]> = {
  [K in T[number] as K['name']]: InferFieldType<K>;
};

type InferFieldType<T extends FieldSchema> = T['type'] extends 'object'
  ? T['fields'] extends readonly FieldSchema[]
    ? InferFieldsType<T['fields']>
    : Record<string, any>
  : T['type'] extends 'array'
  ? T['fields'] extends readonly FieldSchema[]
    ? InferFieldsType<T['fields']>[]
    : any[]
  : T['type'] extends 'number' | 'integer' | 'decimal'
  ? number
  : T['type'] extends 'checkbox' | 'switch'
  ? boolean
  : T['type'] extends 'multi-select' | 'checkbox-group' | 'toggle-button-group'
  ? any[]
  : any;
