import { dynamicPath } from '@dynamic-form-engine/core';
import { useCallback, useMemo } from 'react';
import { useFormContext } from '../context';
import { useFieldSnapshot } from './fieldSnapshot';

/**
 * Value, field state, condition state, and actions for one field, from a
 * single subscription. The component re-renders only when this field's value,
 * error, touched/dirty flags, validation progress, or condition state change.
 * The returned action functions are stable for a given field name.
 */
export function useField<T = unknown>(name: string) {
  const { store, validateField, validationMode } = useFormContext();
  const snapshot = useFieldSnapshot<T>(name);

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

  return useMemo(() => ({
    name,
    value: snapshot.value,
    setValue,
    error: snapshot.error,
    touched: snapshot.touched,
    dirty: snapshot.dirty,
    isValidating: snapshot.isValidating,
    visible: snapshot.visible,
    disabled: snapshot.disabled,
    required: snapshot.required,
    readOnly: snapshot.readOnly,
    setError,
    clearError,
    setTouched,
    validate,
  }), [clearError, name, setError, setTouched, setValue, snapshot, validate]);
}
