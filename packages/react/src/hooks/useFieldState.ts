import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { FieldConditionState, FormState } from '@lourthuxavierm/dynamic-forms-core';
import { useFormContext } from '../context';

const defaultConditionState: FieldConditionState = { visible: true, disabled: false, required: false, readOnly: false };

interface FieldStateSnapshot {
  storeState: FormState;
  conditionVersion: number;
}

export function useFieldState(name: string) {
  const { store, conditionController, isFieldValidating } = useFormContext();
  const cache = useRef<FieldStateSnapshot | undefined>(undefined);
  const subscribe = useCallback((listener: () => void) => {
    const unsubscribeField = store.subscribeToField(name, listener);
    const unsubscribeConditions = conditionController?.subscribe(name, listener);
    return () => { unsubscribeField(); unsubscribeConditions?.(); };
  }, [conditionController, name, store]);
  const getSnapshot = useCallback(() => {
    const storeState = store.getState();
    const conditionVersion = conditionController?.getVersion(name) ?? 0;
    if (cache.current?.storeState === storeState && cache.current.conditionVersion === conditionVersion) return cache.current;
    cache.current = { storeState, conditionVersion };
    return cache.current;
  }, [conditionController, name, store]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const conditions = conditionController?.getState(name) ?? defaultConditionState;
  return {
    error: snapshot.storeState.errors[name],
    touched: snapshot.storeState.touched[name] ?? false,
    dirty: snapshot.storeState.dirty[name] ?? false,
    isValidating: isFieldValidating(name),
    ...conditions,
  };
}
