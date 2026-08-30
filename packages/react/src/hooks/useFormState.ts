import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { FormState, FormValues } from '@lourthuxavierm/dynamic-forms-core';
import { useFormContext } from '../context';

export function useFormState<TSelected = FormState>(selector: (state: FormState) => TSelected = (state) => state as TSelected): TSelected {
  const { store } = useFormContext();
  const subscribe = useCallback((listener: () => void) => store.subscribe(listener), [store]);
  const getSnapshot = useCallback(() => selector(store.getState()), [selector, store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFormActions<T extends FormValues = FormValues>() {
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
