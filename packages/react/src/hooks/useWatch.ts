import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useFormContext } from '../context';

export function useWatch<T = unknown>(path: string): T;
export function useWatch<T = unknown>(paths: readonly string[]): T[];
export function useWatch<T = unknown>(pathOrPaths: string | readonly string[]): T | T[] {
  const { store } = useFormContext();
  const paths = typeof pathOrPaths === 'string' ? [pathOrPaths] : pathOrPaths;
  const key = paths.join('|');
  const cache = useRef<{ state: object; value: T | T[] } | undefined>(undefined);
  const subscribe = useCallback((listener: () => void) => {
    const unsubscribers = paths.map((path) => store.subscribeToField(path, listener));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [key, store]);
  const getSnapshot = useCallback(() => {
    const state = store.getState();
    if (cache.current?.state === state) return cache.current.value;
    const values = paths.map((path) => store.getValue(path));
    const value = typeof pathOrPaths === 'string' ? values[0] as T : values as T[];
    cache.current = { state, value };
    return value;
  }, [key, pathOrPaths, store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
