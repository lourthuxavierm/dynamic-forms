import type { ValidationIssue, Validator } from '@dynamic-forms/core';
import { zodIssueToValidationIssue } from './issues';
import type { ZodFieldValidatorOptions, ZodSchemaLike } from './types';

export type ZodFieldValidatorFactory = <TValue>(
  schema: ZodSchemaLike<TValue>,
  options?: ZodFieldValidatorOptions,
) => Validator<TValue>;

/**
 * Adapts a Zod field schema to a Core validator.
 *
 * Parsed and transformed output is intentionally discarded. Cross-field rules
 * belong in createZodFormValidator, where the complete values object is parsed.
 */
export function createZodFieldValidator<TValue, TOutput = TValue>(
  schema: ZodSchemaLike<TValue, TOutput>,
  options: ZodFieldValidatorOptions = {},
): Validator<TValue> {
  return async (value): Promise<ValidationIssue | undefined> => {
    const result = await schema.safeParseAsync(value);
    if (result.success) return undefined;

    const first = result.error.issues[0];
    if (!first) return { code: 'zod', message: 'Validation failed' };

    const issue = zodIssueToValidationIssue(first);
    if ((options.errorMode ?? 'first') === 'first') return issue;

    const join = options.joinMessages ?? ((messages: readonly string[]) => messages.join('; '));
    return {
      ...issue,
      message: join(result.error.issues.map(({ message }) => message)),
    };
  };
}
