import type { ZodPathSegment } from './types';

/** Internal path contract implemented in Phase 2. */
export interface ZodPathMapping {
  readonly source: readonly ZodPathSegment[];
  readonly target: string;
}
