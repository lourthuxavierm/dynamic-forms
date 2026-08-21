import type { FieldOption, FieldSchema, FieldValidation } from '@dynamic-forms/core';
import type { ComponentType, Ref } from 'react';

/** Shared contract for MUI controls registered with the schema renderer. */
export interface MuiFieldProps<TField extends FieldSchema = FieldSchema, TValue = unknown> {
  name: string;
  field?: TField;
  value?: TValue;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  options?: readonly FieldOption[];
  validation?: FieldValidation;
  inputRef?: Ref<HTMLElement>;
}

/** A permissive component boundary keeps existing and third-party controls compatible. */
export type MuiFieldComponent = ComponentType<any>;
export type MuiFieldRegistry = Readonly<Record<string, MuiFieldComponent>>;
export type MuiFieldRegistryOverrides = Readonly<Record<string, MuiFieldComponent | undefined>>;

export interface MuiFieldRegistration<TField extends FieldSchema = FieldSchema, TValue = unknown> {
  type: string;
  component: ComponentType<MuiFieldProps<TField, TValue>>;
}