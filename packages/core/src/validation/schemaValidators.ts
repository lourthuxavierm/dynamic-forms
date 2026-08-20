import type { FormField, FieldValidation } from '../schema';

import type { Validator } from './types';

export function createFieldValidators(field: FormField): Validator[] {
  const validation = field.validation;

  if (!validation) {
    return [];
  }

  const validators: Validator[] = [];

  if (validation.required) {
    validators.push(requiredValidator(field));
  }

  if (validation.minLength !== undefined) {
    validators.push(minLengthValidator(field, validation.minLength));
  }

  if (validation.maxLength !== undefined) {
    validators.push(maxLengthValidator(field, validation.maxLength));
  }

  if (validation.min !== undefined) {
    validators.push(minValidator(field, validation.min));
  }

  if (validation.max !== undefined) {
    validators.push(maxValidator(field, validation.max));
  }

  if (validation.pattern) {
    validators.push(patternValidator(field, validation.pattern));
  }

  return validators;
}

function requiredValidator(field: FormField): Validator {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return `${field.label ?? field.name} is required`;
    }

    return undefined;
  };
}

function minLengthValidator(field: FormField, minLength: number): Validator {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'string' && value.length < minLength) {
      return `${field.label ?? field.name} must be at least ${minLength} characters`;
    }

    return undefined;
  };
}

function maxLengthValidator(field: FormField, maxLength: number): Validator {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'string' && value.length > maxLength) {
      return `${field.label ?? field.name} must be at most ${maxLength} characters`;
    }

    return undefined;
  };
}

function minValidator(field: FormField, min: number): Validator {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return undefined;
    }

    if (numericValue < min) {
      return `${field.label ?? field.name} must be at least ${min}`;
    }

    return undefined;
  };
}

function maxValidator(field: FormField, max: number): Validator {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return undefined;
    }

    if (numericValue > max) {
      return `${field.label ?? field.name} must be at most ${max}`;
    }

    return undefined;
  };
}

function patternValidator(field: FormField, pattern: string): Validator {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'string') {
      return undefined;
    }

    const regex = new RegExp(pattern);

    if (!regex.test(value)) {
      return `${field.label ?? field.name} has an invalid format`;
    }

    return undefined;
  };
}
