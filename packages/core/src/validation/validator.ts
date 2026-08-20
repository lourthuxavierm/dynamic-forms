import type { ValidationError, ValidationResult, Validator, ValidatorResult } from './types';

export async function validateField<T>(
  field: string,
  value: T,
  values: Record<string, unknown>,
  validators: Validator<T>[] = [],
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  for (const validator of validators) {
    const result = await validator(value, values);
    if (result) errors.push(toValidationError(field, result));
  }

  return { valid: errors.length === 0, errors };
}

function toValidationError(field: string, result: Exclude<ValidatorResult, undefined>): ValidationError {
  return typeof result === 'string'
    ? { field, code: 'custom', message: result }
    : { field, code: result.code, message: result.message };
}
