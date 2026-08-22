import type { FieldSchema } from '@dynamic-forms/core';

export function normalizeFieldPath(path: string): string {
  return path.replaceAll('[', '.').replaceAll(']', '').split('.').filter(Boolean).join('.');
}

export function findFieldByPath(fields: readonly FieldSchema[], requestedPath: string): FieldSchema | undefined {
  const segments = normalizeFieldPath(requestedPath).split('.').filter(Boolean);
  let candidates = fields;
  let field: FieldSchema | undefined;
  for (const segment of segments) {
    if (segment !== '' && Number.isInteger(Number(segment))) continue;
    field = candidates.find((candidate) => candidate.name === segment);
    if (!field) return undefined;
    candidates = field.fields ?? [];
  }
  return field;
}

export function joinFieldPath(parent: string, child: string): string {
  return parent ? parent + '.' + child : child;
}
