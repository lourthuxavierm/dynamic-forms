import type { FieldSchema, FormSchema } from '../schema';
import type { FormErrors, FormValidator } from '../store';
import { getByPath } from '../store';
import { validateField } from './validator';
import type { ValidationIssue, Validator } from './types';

export function createFieldValidators(field: FieldSchema): Validator[] {
  const validation = field.validation;
  if (!validation) return [];

  const validators: Validator[] = [];
  if (validation.required) validators.push(requiredValidator(field));
  if (validation.minLength !== undefined) validators.push(minLengthValidator(field, validation.minLength));
  if (validation.maxLength !== undefined) validators.push(maxLengthValidator(field, validation.maxLength));
  if (validation.min !== undefined) validators.push(minValidator(field, validation.min));
  if (validation.max !== undefined) validators.push(maxValidator(field, validation.max));
  if (validation.pattern) validators.push(patternValidator(field, validation.pattern));
  if (validation.multipleOf !== undefined) validators.push(multipleOfValidator(field, validation.multipleOf));
  if (validation.minItems !== undefined) validators.push(minItemsValidator(field, validation.minItems));
  if (validation.maxItems !== undefined) validators.push(maxItemsValidator(field, validation.maxItems));
  if (validation.uniqueItems) validators.push(uniqueItemsValidator(field));
  return validators;
}

export function createFormValidator(schema: FormSchema): FormValidator {
  return async (values) => {
    const errors: FormErrors = {};
    await validateFields(schema.fields, '', values, errors);
    return errors;
  };
}

async function validateFields(fields: readonly FieldSchema[], parentPath: string, values: Record<string, unknown>, errors: FormErrors): Promise<void> {
  for (const field of fields) {
    const path = parentPath ? `${parentPath}.${field.name}` : field.name;
    const value = getByPath(values, path);
    const result = await validateField(path, value, values, createFieldValidators(field));
    if (!result.valid) errors[path] = result.errors[0].message;

    if (!field.fields) continue;
    if (field.type === 'array' && Array.isArray(value)) {
      await Promise.all(value.map((_, index) => validateFields(field.fields!, `${path}[${index}]`, values, errors)));
    } else {
      await validateFields(field.fields, path, values, errors);
    }
  }
}

function requiredValidator(field: FieldSchema): Validator {
  return (value) => isEmpty(value) ? issue('required', `${label(field)} is required`) : undefined;
}

function minLengthValidator(field: FieldSchema, minLength: number): Validator {
  return (value) => typeof value === 'string' && value.length < minLength ? issue('minLength', `${label(field)} must be at least ${minLength} characters`) : undefined;
}

function maxLengthValidator(field: FieldSchema, maxLength: number): Validator {
  return (value) => typeof value === 'string' && value.length > maxLength ? issue('maxLength', `${label(field)} must be at most ${maxLength} characters`) : undefined;
}

function minValidator(field: FieldSchema, min: number): Validator {
  return (value) => compareNumber(value, min, (actual, limit) => actual < limit, 'min', `${label(field)} must be at least ${min}`);
}

function maxValidator(field: FieldSchema, max: number): Validator {
  return (value) => compareNumber(value, max, (actual, limit) => actual > limit, 'max', `${label(field)} must be at most ${max}`);
}

function patternValidator(field: FieldSchema, pattern: string): Validator {
  const regex = new RegExp(pattern);
  return (value) => typeof value === 'string' && !regex.test(value) ? issue('pattern', `${label(field)} has an invalid format`) : undefined;
}

function multipleOfValidator(field: FieldSchema, multipleOf: number): Validator {
  return (value) => {
    if (isEmpty(value) || multipleOf <= 0) return undefined;
    const actual = Number(value);
    if (!Number.isFinite(actual)) return undefined;
    const quotient = actual / multipleOf;
    return Math.abs(quotient - Math.round(quotient)) > Number.EPSILON * 100
      ? issue('multipleOf', `${label(field)} must be a multiple of ${multipleOf}`)
      : undefined;
  };
}

function minItemsValidator(field: FieldSchema, minItems: number): Validator {
  return (value) => Array.isArray(value) && value.length < minItems ? issue('minItems', `${label(field)} must contain at least ${minItems} items`) : undefined;
}

function maxItemsValidator(field: FieldSchema, maxItems: number): Validator {
  return (value) => Array.isArray(value) && value.length > maxItems ? issue('maxItems', `${label(field)} must contain at most ${maxItems} items`) : undefined;
}

function uniqueItemsValidator(field: FieldSchema): Validator {
  return (value) => {
    if (!Array.isArray(value)) return undefined;
    const values = new Set(value.map((item) => JSON.stringify(item)));
    return values.size !== value.length ? issue('uniqueItems', `${label(field)} must not contain duplicate items`) : undefined;
  };
}

function compareNumber(value: unknown, limit: number, comparison: (actual: number, limit: number) => boolean, code: string, message: string): ValidationIssue | undefined {
  if (isEmpty(value)) return undefined;
  const actual = Number(value);
  return Number.isFinite(actual) && comparison(actual, limit) ? issue(code, message) : undefined;
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === false || (typeof value === 'string' && value.trim().length === 0) || (Array.isArray(value) && value.length === 0) || (typeof value === 'number' && Number.isNaN(value));
}

function label(field: FieldSchema): string {
  return field.label ?? field.name;
}

function issue(code: string, message: string): ValidationIssue {
  return { code, message };
}
