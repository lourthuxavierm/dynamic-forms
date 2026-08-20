import type { ValidationError, ValidationResult, Validator } from './types';

export async function validateField<T>(
  field: string,
  value: T,
  values: Record<string, unknown>,
  validators: Validator<T>[] = [],
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  for (const validator of validators) {
    const message = await validator(value, values);

    if (message) {
      errors.push({
        field,
        message,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
