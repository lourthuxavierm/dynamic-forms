import type { FormErrors, ValidationIssue } from '@lourthuxavierm/dynamic-forms-core';
import { zodPathToFieldPath } from './paths';
import type { ZodAdapterOptions, ZodIssueLike } from './types';

/** Normalized issue mapping result with its Core field path and source issue. */
export interface NormalizedZodIssue {
  readonly field: string;
  readonly issue: ValidationIssue;
  readonly source: ZodIssueLike;
}

export function zodIssueToValidationIssue(issue: ZodIssueLike): ValidationIssue {
  return {
    code: issue.code?.trim() || 'zod',
    message: issue.message,
  };
}

export function normalizeZodIssue(
  issue: ZodIssueLike,
  rootErrorPath = '_form',
): NormalizedZodIssue {
  return {
    field: zodPathToFieldPath(issue.path, rootErrorPath),
    issue: zodIssueToValidationIssue(issue),
    source: issue,
  };
}

export function zodIssuesToFormErrors(
  issues: readonly ZodIssueLike[],
  options: ZodAdapterOptions = {},
): FormErrors {
  const mode = options.errorMode ?? 'first';
  const messages = new Map<string, string[]>();

  for (const source of issues) {
    const normalized = normalizeZodIssue(source, options.rootErrorPath);
    const existing = messages.get(normalized.field);
    if (existing) {
      if (mode === 'all') existing.push(normalized.issue.message);
    } else {
      messages.set(normalized.field, [normalized.issue.message]);
    }
  }

  const join = options.joinMessages ?? ((values: readonly string[]) => values.join('; '));
  return Object.fromEntries(
    [...messages].map(([field, values]) => [field, mode === 'all' ? join(values) : values[0]]),
  );
}
