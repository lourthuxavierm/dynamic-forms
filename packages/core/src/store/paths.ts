/** Immutable utilities for dynamic runtime paths. Typed paths are layered on these primitives. */
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

export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  let result: unknown = obj;
  for (const key of pathKeys(path)) {
    if (!isContainer(result)) return undefined;
    result = read(result, key);
  }
  return result;
}

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
