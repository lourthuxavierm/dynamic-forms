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

export type Validator<T = unknown> = (
  value: T,
  values: Record<string, unknown>,
) => ValidatorResult | Promise<ValidatorResult>;
