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

  // Structural
  | 'object'
  | 'array';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  children?: FieldOption[];
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

export interface FieldSchema {
  name: string;
  type: FieldType | string;
  label?: string;
  defaultValue?: unknown;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  options?: FieldOption[];
  validation?: FieldValidation;
  /**
   * Child fields for 'object' or 'array' types.
   */
  fields?: FieldSchema[];
  /**
   * Custom metadata for the field.
   */
  metadata?: Record<string, unknown>;
}

export interface FormSchema {
  id: string;
  fields: FieldSchema[];
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
export type InferSchemaType<T extends FormSchema | FieldSchema[]> = T extends FormSchema
  ? InferFieldsType<T['fields']>
  : T extends FieldSchema[]
  ? InferFieldsType<T>
  : never;

type InferFieldsType<T extends FieldSchema[]> = {
  [K in T[number] as K['name']]: InferFieldType<K>;
};

type InferFieldType<T extends FieldSchema> = T['type'] extends 'object'
  ? T['fields'] extends FieldSchema[]
    ? InferFieldsType<T['fields']>
    : Record<string, any>
  : T['type'] extends 'array'
  ? T['fields'] extends FieldSchema[]
    ? InferFieldsType<T['fields']>[]
    : any[]
  : T['type'] extends 'number' | 'integer' | 'decimal'
  ? number
  : T['type'] extends 'checkbox' | 'switch'
  ? boolean
  : T['type'] extends 'multi-select' | 'checkbox-group' | 'toggle-button-group'
  ? any[]
  : any;
