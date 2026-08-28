/**
 * Framework-neutral contracts for the future Zod validation adapter.
 *
 * Phase 3 exports deterministic issue normalization and form validation.
 */
export { createZodFormValidator } from './formValidator';
export type { ZodFormValidatorFactory } from './formValidator';
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
