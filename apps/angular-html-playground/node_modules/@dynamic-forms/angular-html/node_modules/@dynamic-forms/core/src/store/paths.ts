/**
 * Simple path utilities for getting and setting values in nested objects.
 * This avoids a heavy dependency like lodash if we only need these basic operations.
 */

export function getByPath(obj: any, path: string): any {
  if (!path) return obj;
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null) return undefined;
    result = result[key];
  }
  return result;
}

export function setByPath(obj: any, path: string, value: any): any {
  if (!path) return value;
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const isNextKeyArrayIndex = /^\d+$/.test(nextKey);

    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = isNextKeyArrayIndex ? [] : {};
    } else {
      current[key] = isNextKeyArrayIndex ? [...current[key]] : { ...current[key] };
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return newObj;
}

export function deleteByPath(obj: any, path: string): any {
  if (!path) return obj;
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] == null) return newObj;
    current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  if (Array.isArray(current)) {
    current.splice(Number(lastKey), 1);
  } else {
    delete current[lastKey];
  }
  return newObj;
}
