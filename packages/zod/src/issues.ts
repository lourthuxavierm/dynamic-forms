import type { ValidationIssue } from '@dynamic-forms/core';
import type { ZodIssueLike } from './types';

/** Internal normalized issue shape implemented in Phase 2. */
export interface NormalizedZodIssue {
  readonly field: string;
  readonly issue: ValidationIssue;
  readonly source: ZodIssueLike;
}
