import { useCallback, useSyncExternalStore } from 'react';

import { useFormContext } from '../context';

export function useField<T = unknown>(name: string) {
  const { store, validateField } = useFormContext();

  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(() => listener()),
    [store],
  );

  const getValue = useCallback(() => store.getValue(name) as T, [store, name]);

  const value = useSyncExternalStore(subscribe, getValue, getValue);

  const setValue = useCallback(
    (nextValue: T) => {
      store.setValue(name, nextValue);
    },
    [store, name],
  );

  const setError = useCallback(
    (message: string) => {
      store.setError(name, message);
    },
    [store, name],
  );

  const clearError = useCallback(() => {
    store.clearError(name);
  }, [store, name]);

  const setTouched = useCallback(
    (touched = true) => {
      store.setTouched(name, touched);
    },
    [store, name],
  );

  const validate = useCallback(
    () => validateField(name),
    [validateField, name],
  );

  const state = store.getState();

  return {
    name,
    value,

    setValue,

    error: state.errors[name],

    touched: state.touched[name] ?? false,

    dirty: state.dirty[name] ?? false,

    setError,
    clearError,
    setTouched,

    validate,
  };
}
