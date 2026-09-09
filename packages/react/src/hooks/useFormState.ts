import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { DynamicFormValues, FormState, FormValues } from '@dynamic-form-engine/core';
import { useFormContext } from '../context';

export function useFormState<TSelected = FormState>(selector: (state: FormState) => TSelected = (state) => state as TSelected): TSelected {
  const { store } = useFormContext();
  const subscribe = useCallback((listener: () => void) => store.subscribeSelector(selector, listener), [selector, store]);
  const getSnapshot = useCallback(() => selector(store.getState()), [selector, store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFormActions<T extends FormValues = DynamicFormValues>() {
  const context = useFormContext<T>();
  return useMemo(() => ({
    setValue: context.store.setValue.bind(context.store),
    setValues: context.store.setValues.bind(context.store),
    setError: context.store.setError.bind(context.store),
    clearError: context.store.clearError.bind(context.store),
    validateField: context.validateField,
    validateForm: context.validateForm,
    submit: context.submit,
    reset: context.reset,
    resetField: context.resetField,
  }), [context.reset, context.resetField, context.store, context.submit, context.validateField, context.validateForm]);
}
