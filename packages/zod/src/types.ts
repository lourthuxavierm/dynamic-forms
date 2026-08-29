/** A segment in a Zod issue path. Numeric segments represent array indexes. */
export type ZodPathSegment = PropertyKey;

/** Minimum issue surface consumed by the adapter across supported Zod majors. */
export interface ZodIssueLike {
  readonly code?: string;
  readonly message: string;
  readonly path: readonly ZodPathSegment[];
}

/** Minimum error surface consumed by the adapter. */
export interface ZodErrorLike {
  readonly issues: readonly ZodIssueLike[];
}

export interface ZodSuccess<TOutput> {
  readonly success: true;
  readonly data: TOutput;
}

export interface ZodFailure {
  readonly success: false;
  readonly error: ZodErrorLike;
}

export type ZodSafeParseResult<TOutput> = ZodSuccess<TOutput> | ZodFailure;

/**
 * Structural async schema contract. It avoids exposing a concrete Zod-major
 * class in this package's declarations.
 */
export interface ZodSchemaLike<TInput = unknown, TOutput = TInput> {
  safeParseAsync(value: TInput): PromiseLike<ZodSafeParseResult<TOutput>>;
}

export type ZodErrorMode = 'first' | 'all';

/** Options shared by issue mapping and form-level validation. */
export interface ZodAdapterOptions {
  rootErrorPath?: string;
  errorMode?: ZodErrorMode;
  joinMessages?: (messages: readonly string[]) => string;
}

/** Options for reducing a field schema's issues to one Core issue. */
export type ZodFieldValidatorOptions = Pick<
  ZodAdapterOptions,
  'errorMode' | 'joinMessages'
>;
