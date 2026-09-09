/** Explicit escape hatch for paths supplied by runtime schemas or external systems. */
declare const dynamicPathBrand: unique symbol;
export type DynamicPath = string & { readonly [dynamicPathBrand]: 'DynamicPath' };

export function dynamicPath(path: string): DynamicPath {
  return path as DynamicPath;
}

type Atomic = string | number | boolean | bigint | symbol | null | undefined | Date | ((...args: never[]) => unknown);
type StringKey<T> = Extract<keyof T, string>;
type ArrayIndex = `${number}`;
type BracketIndex = `[${number}]`;

type NestedPath<T> = T extends Atomic
  ? never
  : T extends readonly (infer TItem)[]
    ? ArrayItemPath<TItem>
    : { [TKey in StringKey<T>]: PropertyPath<TKey, T[TKey]> }[StringKey<T>];

type PropertyPath<TKey extends string, TValue> =
  | TKey
  | (NonNullable<TValue> extends readonly (infer TItem)[]
      ? `${TKey}.${ArrayItemPath<TItem>}` | `${TKey}${BracketArrayItemPath<TItem>}`
      : NonNullable<TValue> extends Atomic
        ? never
        : `${TKey}.${NestedPath<NonNullable<TValue>>}`);

type ArrayItemPath<TItem> =
  | ArrayIndex
  | (NonNullable<TItem> extends Atomic ? never : `${ArrayIndex}.${NestedPath<NonNullable<TItem>>}`);

type BracketArrayItemPath<TItem> =
  | BracketIndex
  | (NonNullable<TItem> extends Atomic ? never : `${BracketIndex}.${NestedPath<NonNullable<TItem>>}`);

/** Dot and bracket paths for known values. Broad runtime records intentionally accept string. */
export type Path<TValues> = string extends keyof TValues ? string : Extract<NestedPath<TValues>, string>;

type NormalizePath<TPath extends string> = TPath extends `${infer THead}[${infer TIndex}]${infer TTail}`
  ? NormalizePath<`${THead}.${TIndex}${TTail}`>
  : TPath extends `.${infer TRest}`
    ? NormalizePath<TRest>
    : TPath;

type SegmentValue<TValue, TSegment extends string> = unknown extends TValue
  ? unknown
  : TValue extends null | undefined
  ? undefined
  : TSegment extends keyof TValue
    ? TValue[TSegment]
    : TValue extends readonly (infer TItem)[]
      ? TSegment extends ArrayIndex ? TItem : never
      : never;

type ValueAtPath<TValue, TPath extends string> = TPath extends `${infer THead}.${infer TTail}`
  ? ValueAtPath<SegmentValue<TValue, THead>, TTail>
  : SegmentValue<TValue, TPath>;

/** Value resolved at a known path. Dynamic strings deliberately resolve to unknown. */
export type PathValue<TValues, TPath extends string> = string extends TPath
  ? unknown
  : ValueAtPath<TValues, NormalizePath<TPath>>;

/** Immutable utilities for dynamic runtime paths. */
type PathContainer = Record<string, unknown> | unknown[];

function pathKeys(path: string): string[] {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
}

function isContainer(value: unknown): value is PathContainer {
  return value !== null && typeof value === 'object';
}

function read(container: PathContainer, key: string): unknown {
  return Array.isArray(container) ? container[Number(key)] : container[key];
}

function write(container: PathContainer, key: string, value: unknown): void {
  if (Array.isArray(container)) container[Number(key)] = value;
  else container[key] = value;
}

function cloneContainer(value: unknown, arrayFallback = false): PathContainer {
  if (Array.isArray(value)) return [...value];
  if (isContainer(value)) return { ...value };
  return arrayFallback ? [] : {};
}

export function getByPath<TValues, TPath extends Path<TValues>>(
  obj: TValues,
  path: TPath,
): PathValue<TValues, TPath>;
export function getByPath(obj: unknown, path: DynamicPath): unknown;
export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  let result: unknown = obj;
  for (const key of pathKeys(path)) {
    if (!isContainer(result)) return undefined;
    result = read(result, key);
  }
  return result;
}

export function setByPath<TValues, TPath extends Path<TValues>>(
  obj: TValues,
  path: TPath,
  value: PathValue<TValues, TPath>,
): TValues;
export function setByPath<TValues>(obj: TValues, path: DynamicPath, value: unknown): TValues;
export function setByPath(obj: unknown, path: string, value: unknown): unknown {
  if (!path) return value;
  const keys = pathKeys(path);
  const root = cloneContainer(obj, /^\d+$/.test(keys[0]));
  let current = root;

  for (let index = 0; index < keys.length - 1; index++) {
    const key = keys[index];
    const cloned = cloneContainer(read(current, key), /^\d+$/.test(keys[index + 1]));
    write(current, key, cloned);
    current = cloned;
  }

  write(current, keys[keys.length - 1], value);
  return root;
}

export function deleteByPath<TValues, TPath extends Path<TValues>>(obj: TValues, path: TPath): TValues;
export function deleteByPath<TValues>(obj: TValues, path: DynamicPath): TValues;
export function deleteByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const keys = pathKeys(path);
  const root = cloneContainer(obj, Array.isArray(obj));
  let current = root;

  for (let index = 0; index < keys.length - 1; index++) {
    const key = keys[index];
    const existing = read(current, key);
    if (!isContainer(existing)) return root;
    const cloned = cloneContainer(existing);
    write(current, key, cloned);
    current = cloned;
  }

  const lastKey = keys[keys.length - 1];
  if (Array.isArray(current)) current.splice(Number(lastKey), 1);
  else delete current[lastKey];
  return root;
}