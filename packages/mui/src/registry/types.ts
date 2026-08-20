import type { FieldOption } from '@dynamic-forms/core';
import type { ComponentType } from 'react';

export interface MuiFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  options?: FieldOption[];
}

export interface BaseFormField {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;

  validation?: FieldValidation;

  options?: FieldOption[];
}

export interface NumericFieldConfig {
  min?: number;
  max?: number;
  step?: number;
}

export interface CurrencyFieldConfig {
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface CurrencyFieldConfig {
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SliderFieldConfig {
  min?: number;
  max?: number;
  step?: number;
}

export interface RatingFieldConfig {
  max?: number;
  precision?: number;
}
export interface PhoneFieldConfig {
  defaultCountryCode?: string;
}
export interface OtpFieldConfig {
  length?: number;
}
export interface PinFieldConfig {
  length?: number;
}
export interface PinFieldConfig {
  length?: number;
}
export type MuiFieldComponent = ComponentType<MuiFieldProps>;

export type MuiFieldRegistry = Partial<Record<string, MuiFieldComponent>>;
