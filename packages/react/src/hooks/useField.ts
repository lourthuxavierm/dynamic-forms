import { useCallback, useSyncExternalStore } from 'react';
import { useFormContext } from '../context';

export function useField<T = unknown>(name: string) {
  const { store, validateField, validationMode, isFieldValidating } = useFormContext();
  const subscribe = useCallback((listener: () => void) => store.subscribeToField(name, listener), [name, store]);
  const getSnapshot = useCallback(() => store.getState(), [store]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = useCallback((nextValue: T) => {
    store.setValue(name, nextValue);
    if (validationMode === 'onChange') void validateField(name);
  }, [name, store, validateField, validationMode]);
  const setError = useCallback((message: string) => store.setError(name, message), [name, store]);
  const clearError = useCallback(() => store.clearError(name), [name, store]);
  const setTouched = useCallback((touched = true) => {
    store.setTouched(name, touched);
    if (touched && validationMode === 'onBlur') void validateField(name);
  }, [name, store, validateField, validationMode]);
  const validate = useCallback(() => validateField(name), [validateField, name]);

  return { name, value: store.getValue(name) as T, setValue, error: state.errors[name], touched: state.touched[name] ?? false, dirty: state.dirty[name] ?? false, isValidating: isFieldValidating(name), setError, clearError, setTouched, validate };
}
