/**
 * Framework-neutral contracts for the future Zod validation adapter.
 *
 * Phase 1 intentionally exports types only. Validator factories are introduced
 * after issue-path and behavior contracts have executable tests.
 */
export type {
  ZodAdapterOptions,
  ZodErrorLike,
  ZodErrorMode,
  ZodFailure,
  ZodIssueLike,
  ZodPathSegment,
  ZodSafeParseResult,
  ZodSchemaLike,
  ZodSuccess,
} from './types';
