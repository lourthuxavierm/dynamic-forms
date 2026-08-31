export interface SerializedRHFFile {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly lastModified: number;
}

export interface SerializeRHFValuesOptions {
  /** Metadata is JSON-safe; preserve keeps File objects; omit returns undefined. */
  fileStrategy?: 'metadata' | 'preserve' | 'omit';
}

export function serializeRHFValues<T>(
  values: T,
  options: SerializeRHFValuesOptions = {},
): unknown {
  return serializeValue(values, options.fileStrategy ?? 'metadata', new WeakSet<object>());
}

function serializeValue(
  value: unknown,
  strategy: NonNullable<SerializeRHFValuesOptions['fileStrategy']>,
  seen: WeakSet<object>,
): unknown {
  if (typeof File !== 'undefined' && value instanceof File) {
    if (strategy === 'preserve') return value;
    if (strategy === 'omit') return undefined;
    return {
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified,
    } satisfies SerializedRHFFile;
  }
  if (value instanceof Date) return value.toISOString();
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) throw new TypeError('Cannot serialize cyclic RHF values');
  seen.add(value);
  if (Array.isArray(value)) {
    const result = value.map((entry) => serializeValue(entry, strategy, seen));
    seen.delete(value);
    return result;
  }
  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    const serialized = serializeValue(nested, strategy, seen);
    if (serialized !== undefined || strategy !== 'omit') result[key] = serialized;
  }
  seen.delete(value);
  return result;
}
