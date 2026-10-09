import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import type { DynamicFormValues, FormState, FormValues } from '@dynamic-form-engine/core';
import { useFormContext } from '../context';

const identity = <T,>(state: FormState) => state as unknown as T;

/**
 * Selects a slice of form-level state. The component re-renders only when the
 * selected value changes according to `equality` (default `Object.is`), so
 * selectors may return derived objects when paired with a structural equality
 * such as `shallowEqual`. The selector may be an inline function.
 */
export function useFormState<TSelected = FormState>(
  selector: (state: FormState) => TSelected = identity,
  equality: (previous: TSelected, next: TSelected) => boolean = Object.is,
): TSelected {
  const { store } = useFormContext();
  const selectorRef = useRef(selector);
  const equalityRef = useRef(equality);
  selectorRef.current = selector;
  equalityRef.current = equality;
  const cache = useRef<{ state: FormState; selected: TSelected; selector: unknown } | undefined>(undefined);

  const subscribe = useCallback((listener: () => void) => store.subscribe(() => listener()), [store]);
  const getSnapshot = useCallback((): TSelected => {
    const state = store.getState();
    const cached = cache.current;
    if (cached && cached.state === state && cached.selector === selectorRef.current) return cached.selected;
    const selected = selectorRef.current(state);
    if (cached && equalityRef.current(cached.selected, selected)) {
      cache.current = { state, selected: cached.selected, selector: selectorRef.current };
      return cached.selected;
    }
    cache.current = { state, selected, selector: selectorRef.current };
    return selected;
  }, [store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Shallow structural equality for objects and arrays returned by `useFormState` selectors. */
export function shallowEqual<T>(previous: T, next: T): boolean {
  if (Object.is(previous, next)) return true;
  if (typeof previous !== 'object' || typeof next !== 'object' || previous === null || next === null) return false;
  const a = previous as Record<string, unknown>;
  const b = next as Record<string, unknown>;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && Object.is(a[key], b[key]));
}

/**
 * Stable mutation, validation, submission, and reset actions. Does not
 * subscribe to state, and the returned object keeps its identity for the life
 * of the store, even when provider callbacks such as `onSubmit` are inline.
 */
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
