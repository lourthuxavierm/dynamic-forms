import type { FormValidator } from '@dynamic-forms/core';
import type { ZodAdapterOptions, ZodSchemaLike } from './types';

/** Public factory signature reserved for the form-validation phase. */
export type ZodFormValidatorFactory = <TValues extends Record<string, unknown>>(
  schema: ZodSchemaLike<TValues>,
  options?: ZodAdapterOptions,
) => FormValidator<TValues>;
