import type { FieldSchema } from '@lourthuxavierm/dynamic-forms-core';

const missingField = Symbol('missing-field');
const schemaPathCache = new WeakMap<readonly FieldSchema[], Map<string, FieldSchema | typeof missingField>>();

export function normalizeFieldPath(path: string): string {
  return path.replaceAll('[', '.').replaceAll(']', '').split('.').filter(Boolean).join('.');
}

export function findFieldByPath(fields: readonly FieldSchema[], requestedPath: string): FieldSchema | undefined {
  const normalizedPath = normalizeFieldPath(requestedPath);
  let cache = schemaPathCache.get(fields);
  if (!cache) {
    cache = new Map();
    schemaPathCache.set(fields, cache);
  }
  const cached = cache.get(normalizedPath);
  if (cached) return cached === missingField ? undefined : cached;
  const segments = normalizedPath.split('.').filter(Boolean);
  let candidates = fields;
  let field: FieldSchema | undefined;
  for (const segment of segments) {
    if (segment !== '' && Number.isInteger(Number(segment))) continue;
    field = candidates.find((candidate) => candidate.name === segment);
    if (!field) {
      cache.set(normalizedPath, missingField);
      return undefined;
    }
    candidates = field.fields ?? [];
  }
  cache.set(normalizedPath, field ?? missingField);
  return field;
}

export function joinFieldPath(parent: string, child: string): string {
  return parent ? parent + '.' + child : child;
}
