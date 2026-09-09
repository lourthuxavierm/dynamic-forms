import type { DynamicFormValues, FormValues } from '../store/types';

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface ValidationError extends ValidationIssue {
  field: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export type ValidatorResult = string | ValidationIssue | undefined;

export type Validator<
  TValue = unknown,
  TValues extends FormValues = DynamicFormValues,
> = (
  value: TValue,
  values: Readonly<TValues>,
) => ValidatorResult | Promise<ValidatorResult>;