import type { FormErrors, FormValidator } from '@dynamic-form-engine/core';
import { zodIssuesToFormErrors } from './issues';
import type { ZodAdapterOptions, ZodSchemaLike } from './types';

export type ZodFormValidatorFactory = <TValues extends Record<string, unknown>>(
  schema: ZodSchemaLike<TValues>,
  options?: ZodAdapterOptions,
) => FormValidator<TValues>;

/**
 * Adapts a Zod-compatible schema to the Core form-validator contract.
 *
 * Parsed or transformed output is intentionally discarded: validation never
 * writes values into FormStore.
 */
export function createZodFormValidator<
  TValues extends Record<string, unknown>,
  TOutput = TValues,
>(
  schema: ZodSchemaLike<TValues, TOutput>,
  options: ZodAdapterOptions = {},
): FormValidator<TValues> {
  return async (values): Promise<FormErrors> => {
    const result = await schema.safeParseAsync(values as TValues);
    return result.success ? {} : zodIssuesToFormErrors(result.error.issues, options);
  };
}
