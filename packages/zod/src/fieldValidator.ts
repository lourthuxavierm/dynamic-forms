import type { Validator } from '@dynamic-forms/core';
import type { ZodAdapterOptions, ZodSchemaLike } from './types';

/** Public factory signature reserved for the field-validation phase. */
export type ZodFieldValidatorFactory = <TValue>(
  schema: ZodSchemaLike<TValue>,
  options?: ZodAdapterOptions,
) => Validator<TValue>;
