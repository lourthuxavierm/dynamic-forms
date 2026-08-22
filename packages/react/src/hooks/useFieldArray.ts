import { useCallback, useMemo, useRef } from 'react';
import { useField } from './useField';

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
const createId = () => 'df-array-' + (++nextArrayId).toString(36);

export function useFieldArray<T = unknown>(name: string): UseFieldArrayReturn<T> {
  const field = useField<readonly T[]>(name);
  const values = Array.isArray(field.value) ? field.value : [];
  const previous = useRef<readonly FieldArrayItem<T>[]>([]);
  const fields = useMemo(() => reconcile(previous.current, values), [values]);
  previous.current = fields;

  const set = useCallback((next: readonly T[]) => field.setValue([...next]), [field.setValue]);
  const append = useCallback((value: T) => set([...values, value]), [set, values]);
  const prepend = useCallback((value: T) => set([value, ...values]), [set, values]);
  const insert = useCallback((index: number, value: T) => { const next=[...values]; next.splice(clamp(index, 0, next.length), 0, value); set(next); }, [set, values]);
  const remove = useCallback((index: number) => { if (index < 0 || index >= values.length) return; const next=[...values]; next.splice(index, 1); set(next); }, [set, values]);
  const move = useCallback((from: number, to: number) => { if (from < 0 || from >= values.length) return; const next=[...values]; const [item]=next.splice(from,1); next.splice(clamp(to,0,next.length),0,item); set(next); }, [set, values]);
  const swap = useCallback((left: number, right: number) => { if (left < 0 || right < 0 || left >= values.length || right >= values.length) return; const next=[...values]; [next[left],next[right]]=[next[right],next[left]]; set(next); }, [set, values]);
  const update = useCallback((index: number, value: T) => { if (index < 0 || index >= values.length) return; const next=[...values]; next[index]=value; set(next); }, [set, values]);
  const replace = useCallback((next: readonly T[]) => set(next), [set]);

  return useMemo(() => ({ fields, append, prepend, insert, remove, move, swap, update, replace }), [append, fields, insert, move, prepend, remove, replace, swap, update]);
}

function reconcile<T>(previous: readonly FieldArrayItem<T>[], values: readonly T[]): readonly FieldArrayItem<T>[] {
  const unused = [...previous];
  return values.map((value) => {
    const index = unused.findIndex((item) => Object.is(item.value, value));
    if (index < 0) return { id: createId(), value };
    return unused.splice(index, 1)[0];
  });
}
function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
