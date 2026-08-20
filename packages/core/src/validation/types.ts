export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export type Validator<T = unknown> = (
  value: T,
  values: Record<string, unknown>,
) => string | undefined | Promise<string | undefined>;
