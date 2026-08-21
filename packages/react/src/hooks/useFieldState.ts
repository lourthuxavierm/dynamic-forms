import { useCallback, useSyncExternalStore } from 'react';
import type { FieldConditionState } from '@dynamic-forms/core';
import { useFormContext } from '../context';

const defaultConditionState: FieldConditionState = { visible: true, disabled: false, required: false, readOnly: false };

export function useFieldState(name: string) {
  const { store, conditionController, isFieldValidating } = useFormContext();
  const subscribe = useCallback((listener: () => void) => {
    const unsubscribeField = store.subscribeToField(name, listener);
    const unsubscribeConditions = conditionController?.subscribe(listener);
    return () => { unsubscribeField(); unsubscribeConditions?.(); };
  }, [conditionController, name, store]);
  const getSnapshot = useCallback(() => store.getState(), [store]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const conditions = conditionController?.getState(name) ?? defaultConditionState;
  return {
    error: state.errors[name],
    touched: state.touched[name] ?? false,
    dirty: state.dirty[name] ?? false,
    isValidating: isFieldValidating(name),
    ...conditions,
  };
}
