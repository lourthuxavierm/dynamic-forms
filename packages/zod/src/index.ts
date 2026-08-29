/**
 * Framework-neutral contracts for the Zod validation adapter.
 *
 * Phase 4 exports deterministic issue normalization plus form and field validation.
 */
export { createZodFieldValidator } from './fieldValidator';
export type { ZodFieldValidatorFactory } from './fieldValidator';
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
  ZodFieldValidatorOptions,
  ZodIssueLike,
  ZodPathSegment,
  ZodSafeParseResult,
  ZodSchemaLike,
  ZodSuccess,
} from './types';
