/**
 * Framework-neutral contracts for the future Zod validation adapter.
 *
 * Phase 2 exports deterministic issue normalization. Validator factories are
 * introduced in later behavior phases.
 */
export { zodPathToFieldPath } from './paths';
export {
  normalizeZodIssue,
  zodIssuesToFormErrors,
  zodIssueToValidationIssue,
} from './issues';
export type { NormalizedZodIssue } from './issues';
export type { ZodPathMapping } from './paths';
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
