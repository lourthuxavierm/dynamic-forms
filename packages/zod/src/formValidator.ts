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
 * writes values into FormStore. A request whose abort signal has already fired
 * rejects with its abort reason before parsing starts.
 */
export function createZodFormValidator<
  TValues extends Record<string, unknown>,
  TOutput = TValues,
>(
  schema: ZodSchemaLike<TValues, TOutput>,
  options: ZodAdapterOptions = {},
): FormValidator<TValues> {
  return async (values, context): Promise<FormErrors> => {
    // Zod parsing cannot be interrupted; skip work for a request that is already superseded.
    context?.signal.throwIfAborted();
    const result = await schema.safeParseAsync(values as TValues);
    return result.success ? {} : zodIssuesToFormErrors(result.error.issues, options);
  };
}
