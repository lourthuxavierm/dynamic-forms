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
  /** Stable builder identity, independent from the data-binding name. */
  id?: string;
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
  /** Namespaced renderer or application extensions. */
  extensions?: Readonly<Record<string, unknown>>;
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

export interface StringValidationRules { required?: boolean; minLength?: number; maxLength?: number; pattern?: string; }
export interface NumberValidationRules { required?: boolean; min?: number; max?: number; multipleOf?: number; }
export interface ArrayValidationRules { required?: boolean; minItems?: number; maxItems?: number; uniqueItems?: boolean; }
export interface BooleanValidationRules { required?: boolean; }

type StructuralFieldType = 'object' | 'array';
type StringFieldType = 'text' | 'textarea' | 'password' | 'email' | 'url' | 'phone' | 'otp' | 'pin' | 'mask';
type NumberFieldType = 'number' | 'integer' | 'decimal' | 'currency' | 'percentage' | 'slider' | 'rating' | 'year';
type BooleanFieldType = 'checkbox' | 'switch' | 'toggle-button';
type CollectionFieldType = 'multi-select' | 'checkbox-group' | 'toggle-button-group' | 'tree-checkbox' | 'multi-file';
type ScalarFieldType = Exclude<keyof FieldValueMap, StructuralFieldType | StringFieldType | NumberFieldType | BooleanFieldType | CollectionFieldType>;
type CommonFieldProperties = Pick<FieldSchema,
  'id' | 'name' | 'label' | 'placeholder' | 'description' | 'disabled' | 'readOnly' |
  'visibleWhen' | 'disabledWhen' | 'requiredWhen' | 'readOnlyWhen' | 'hiddenValuePolicy' |
  'dependsOn' | 'resetOnDependencyChange' | 'metadata' | 'extensions'
>;
type ValidationFor<TType extends keyof FieldValueMap> =
  TType extends StringFieldType ? StringValidationRules :
  TType extends NumberFieldType ? NumberValidationRules :
  TType extends CollectionFieldType ? ArrayValidationRules :
  TType extends BooleanFieldType ? BooleanValidationRules : FieldValidation;
type ConfigFor<TType extends keyof FieldValueMap> =
  TType extends StringFieldType ? TextFieldConfig | MaskFieldConfig | SegmentedFieldConfig :
  TType extends NumberFieldType ? NumericFieldConfig | CurrencyFieldConfig | RangeFieldConfig | YearFieldConfig :
  TType extends CollectionFieldType | ScalarFieldType ? ChoiceFieldConfig | DateTimeFieldConfig | FileFieldConfig : never;

export type ValueFieldSchema<TType extends Exclude<keyof FieldValueMap, StructuralFieldType>> = CommonFieldProperties & {
  type: TType;
  defaultValue?: FieldValueMap[TType];
  validation?: ValidationFor<TType>;
  config?: ConfigFor<TType>;
  options?: readonly FieldOption[];
  dataSource?: DataSourceConfig;
  fields?: never;
};
export interface ObjectFieldSchema extends CommonFieldProperties { type: 'object'; fields: readonly FormField[]; defaultValue?: Record<string, unknown>; validation?: BooleanValidationRules; options?: never; dataSource?: never; }
export interface ArrayFieldSchema extends CommonFieldProperties { type: 'array'; fields: readonly FormField[]; defaultValue?: unknown[]; validation?: ArrayValidationRules; config?: ArrayFieldConfig; options?: never; dataSource?: never; }
export type FormField =
  | ValueFieldSchema<StringFieldType>
  | ValueFieldSchema<NumberFieldType>
  | ValueFieldSchema<BooleanFieldType>
  | ValueFieldSchema<CollectionFieldType>
  | ValueFieldSchema<ScalarFieldType>
  | ObjectFieldSchema
  | ArrayFieldSchema;

/** Strict persisted-schema authoring contract. Use FieldSchema for registered programmatic custom controls. */
export interface StrictFormSchema<TFields extends readonly FormField[] = readonly FormField[]> extends Omit<FormSchema, 'fields' | 'schemaVersion'> { schemaVersion: 1; fields: TFields; }
export function defineFormSchema<const TFields extends readonly FormField[]>(schema: StrictFormSchema<TFields>): StrictFormSchema<TFields> { return schema; }

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { readonly [key: string]: JsonValue } | readonly JsonValue[];
export type PortableDataSourceConfig<T extends JsonValue = JsonValue> =
  | { type: 'static'; options: readonly T[]; cache?: boolean; cacheKey?: string }
  | { type: 'url'; url: string; method?: 'GET' | 'POST'; params?: Readonly<Record<string, JsonValue>>; searchParam?: string; pageParam?: string; pageSizeParam?: string; cache?: boolean; cacheKey?: string };
type PortableProperties = {
  metadata?: Readonly<Record<string, JsonValue>>;
  extensions?: Readonly<Record<string, JsonValue>>;
};
type PortableValueFieldSchema<TType extends Exclude<keyof FieldValueMap, StructuralFieldType>> =
  Omit<ValueFieldSchema<TType>, 'dataSource' | 'metadata' | 'extensions'> & PortableProperties & { dataSource?: PortableDataSourceConfig };
export type PortableFormField =
  | PortableValueFieldSchema<StringFieldType>
  | PortableValueFieldSchema<NumberFieldType>
  | PortableValueFieldSchema<BooleanFieldType>
  | PortableValueFieldSchema<CollectionFieldType>
  | PortableValueFieldSchema<ScalarFieldType>
  | (Omit<ObjectFieldSchema, 'fields' | 'metadata' | 'extensions'> & PortableProperties & { fields: readonly PortableFormField[] })
  | (Omit<ArrayFieldSchema, 'fields' | 'metadata' | 'extensions'> & PortableProperties & { fields: readonly PortableFormField[] });
export interface PortableFormSchema<TFields extends readonly PortableFormField[] = readonly PortableFormField[]> extends Omit<FormSchema, 'fields' | 'schemaVersion'> { schemaVersion: 1; fields: TFields; }
export function definePortableFormSchema<const TFields extends readonly PortableFormField[]>(schema: PortableFormSchema<TFields>): PortableFormSchema<TFields> { return schema; }

/** Infer form values from a const schema while retaining custom field-map support. */
export type InferFormValues<
  T extends FormSchema<unknown> | readonly FieldSchema<unknown>[],
  TCustomValues extends Record<string, unknown> = Record<never, never>,
> = T extends FormSchema<unknown>
  ? InferFieldsType<T['fields'], TCustomValues>
  : T extends readonly FieldSchema<unknown>[]
    ? InferFieldsType<T, TCustomValues>
    : never;

/** @deprecated Use InferFormValues. */
export type InferSchemaType<
  T extends FormSchema<unknown> | readonly FieldSchema<unknown>[],
  TCustomValues extends Record<string, unknown> = Record<never, never>,
> = InferFormValues<T, TCustomValues>;

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
      ? T extends { metadata: { primitiveItems: true } }
        ? T['fields'] extends readonly [infer TItem extends FieldSchema<unknown>]
          ? InferFieldType<TItem, TCustomValues>[]
          : InferFieldsType<T['fields'], TCustomValues>[]
        : InferFieldsType<T['fields'], TCustomValues>[]
      : FieldValueMap['array']
    : FieldValue<Extract<T['type'], string>, TCustomValues>;
