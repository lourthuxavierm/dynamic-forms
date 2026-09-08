import { dynamicPath } from '@dynamic-form-engine/core';
import { useCallback, useSyncExternalStore } from 'react';
import { useFormContext } from '../context';

export function useField<T = unknown>(name: string) {
  const { store, validateField, validationMode, isFieldValidating } = useFormContext();
  const subscribe = useCallback((listener: () => void) => store.subscribeToField(dynamicPath(name), listener), [name, store]);
  const getSnapshot = useCallback(() => store.getState(), [store]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback((nextValue: T) => {
    store.setValue(dynamicPath(name), nextValue);
    if (validationMode === 'onChange') void validateField(name);
  }, [name, store, validateField, validationMode]);
  const setError = useCallback((message: string) => store.setError(dynamicPath(name), message), [name, store]);
  const clearError = useCallback(() => store.clearError(dynamicPath(name)), [name, store]);
  const setTouched = useCallback((touched = true) => {
    store.setTouched(dynamicPath(name), touched);
    if (touched && validationMode === 'onBlur') void validateField(name);
  }, [name, store, validateField, validationMode]);
  const validate = useCallback(() => validateField(name), [validateField, name]);

  return { name, value: store.getValue(dynamicPath(name)) as T, setValue, error: state.errors[name], touched: state.touched[name] ?? false, dirty: state.dirty[name] ?? false, isValidating: isFieldValidating(name), setError, clearError, setTouched, validate };
}
