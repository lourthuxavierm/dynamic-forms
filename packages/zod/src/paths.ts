import type { ZodPathSegment } from './types';

export interface ZodPathMapping {
  readonly source: readonly ZodPathSegment[];
  readonly target: string;
}

const SIMPLE_SEGMENT = /^[^.[\]]+$/;

/**
 * Converts a Zod issue path to the Core dot/bracket convention.
 *
 * Quoted and symbolic segments are diagnostic paths because Dynamic Forms
 * schema field names cannot contain path separators.
 */
export function zodPathToFieldPath(
  path: readonly ZodPathSegment[],
  rootErrorPath = '_form',
): string {
  if (path.length === 0) return normalizeRootPath(rootErrorPath);

  let target = '';
  for (const segment of path) {
    if (typeof segment === 'number') {
      target += Number.isInteger(segment) && segment >= 0
        ? `[${segment}]`
        : `[${JSON.stringify(String(segment))}]`;
      continue;
    }
    if (typeof segment === 'symbol') {
      target += `[${JSON.stringify(`$symbol:${segment.description ?? ''}`)}]`;
      continue;
    }
    if (SIMPLE_SEGMENT.test(segment)) {
      target += target ? `.${segment}` : segment;
    } else {
      target += `[${JSON.stringify(segment)}]`;
    }
  }
  return target || normalizeRootPath(rootErrorPath);
}

function normalizeRootPath(path: string): string {
  return path.trim() || '_form';
}
