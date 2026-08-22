import { useCallback, useMemo, useRef } from 'react';
import { useField } from './useField';
import { useFormContext } from '../context';

export interface FieldArrayItem<T> { readonly id: string; readonly value: T; }
export interface UseFieldArrayReturn<T> {
  fields: readonly FieldArrayItem<T>[];
  append(value: T): void;
  prepend(value: T): void;
  insert(index: number, value: T): void;
  remove(index: number): void;
  move(from: number, to: number): void;
  swap(left: number, right: number): void;
  update(index: number, value: T): void;
  replace(values: readonly T[]): void;
}

let nextArrayId = 0;
const arrayIdentityCache = new WeakMap<object, Map<string, readonly FieldArrayItem<unknown>[]>>();
const createId = () => 'df-array-' + (++nextArrayId).toString(36);

export function useFieldArray<T = unknown>(name: string): UseFieldArrayReturn<T> {
  const field = useField<readonly T[]>(name);
  const { store } = useFormContext();
  let storeCache = arrayIdentityCache.get(store);
  if (!storeCache) { storeCache = new Map(); arrayIdentityCache.set(store, storeCache); }
  const values = Array.isArray(field.value) ? field.value : [];
  const previous = useRef<readonly FieldArrayItem<T>[]>((storeCache.get(name) ?? []) as readonly FieldArrayItem<T>[]);
  const fields = useMemo(() => reconcile(previous.current, values), [values]);
  previous.current = fields;
  storeCache.set(name, fields as readonly FieldArrayItem<unknown>[]);

  const set = useCallback((next: readonly T[], nextFields?: readonly FieldArrayItem<T>[]) => {
    if (nextFields) {
      previous.current = nextFields;
      storeCache.set(name, nextFields as readonly FieldArrayItem<unknown>[]);
    }
    field.setValue([...next]);
  }, [field.setValue, name, storeCache]);
  const append = useCallback((value: T) => set([...values, value], [...fields, { id: createId(), value }]), [fields, set, values]);
  const prepend = useCallback((value: T) => set([value, ...values], [{ id: createId(), value }, ...fields]), [fields, set, values]);
  const insert = useCallback((index: number, value: T) => {
    const at = clamp(index, 0, values.length);
    const next = [...values];
    const keyed = [...fields];
    next.splice(at, 0, value);
    keyed.splice(at, 0, { id: createId(), value });
    set(next, keyed);
  }, [fields, set, values]);
  const remove = useCallback((index: number) => {
    if (index < 0 || index >= values.length) return;
    const next = [...values];
    const keyed = [...fields];
    next.splice(index, 1);
    keyed.splice(index, 1);
    set(next, keyed);
  }, [fields, set, values]);
  const move = useCallback((from: number, to: number) => {
    if (from < 0 || from >= values.length) return;
    const target = clamp(to, 0, values.length - 1);
    const next = [...values];
    const keyed = [...fields];
    const [item] = next.splice(from, 1);
    const [key] = keyed.splice(from, 1);
    next.splice(target, 0, item);
    keyed.splice(target, 0, key);
    set(next, keyed);
  }, [fields, set, values]);
  const swap = useCallback((left: number, right: number) => {
    if (left < 0 || right < 0 || left >= values.length || right >= values.length) return;
    const next = [...values];
    const keyed = [...fields];
    [next[left], next[right]] = [next[right], next[left]];
    [keyed[left], keyed[right]] = [keyed[right], keyed[left]];
    set(next, keyed);
  }, [fields, set, values]);
  const update = useCallback((index: number, value: T) => {
    if (index < 0 || index >= values.length) return;
    const next = [...values];
    const keyed = [...fields];
    next[index] = value;
    keyed[index] = { ...keyed[index], value };
    set(next, keyed);
  }, [fields, set, values]);
  const replace = useCallback((next: readonly T[]) => set(next, reconcile(fields, next)), [fields, set]);

  return useMemo(() => ({ fields, append, prepend, insert, remove, move, swap, update, replace }), [append, fields, insert, move, prepend, remove, replace, swap, update]);
}

function reconcile<T>(previous: readonly FieldArrayItem<T>[], values: readonly T[]): readonly FieldArrayItem<T>[] {
  const result: Array<FieldArrayItem<T> | undefined> = new Array(values.length);
  const used = new Set<number>();

  // A value absent from the next collection is an in-place edit when its position still exists.
  // Reserve that row identity before matching moves of the remaining values.
  for (let index = 0; index < Math.min(previous.length, values.length); index += 1) {
    const oldValueStillExists = values.some((value) => Object.is(value, previous[index].value));
    const newValueAlreadyExisted = previous.some((item) => Object.is(item.value, values[index]));
    if (!oldValueStillExists && !newValueAlreadyExisted) {
      result[index] = { ...previous[index], value: values[index] };
      used.add(index);
    }
  }

  for (let index = 0; index < values.length; index += 1) {
    if (result[index]) continue;
    const previousIndex = previous.findIndex((item, candidate) => !used.has(candidate) && Object.is(item.value, values[index]));
    if (previousIndex >= 0) {
      result[index] = previous[previousIndex];
      used.add(previousIndex);
    }
  }

  return Array.from({ length: values.length }, (_, index) => result[index] ?? { id: createId(), value: values[index] });
}
function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
