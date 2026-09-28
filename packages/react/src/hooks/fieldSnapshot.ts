import { useCallback, useRef, useSyncExternalStore } from 'react';
import {
  dynamicPath,
  normalizePath,
  type FieldConditionState,
  type FormState,
} from '@dynamic-form-engine/core';
import { useFormContext } from '../context';
import { DEFAULT_CONDITION_STATE, evaluateFieldConditions, readPathRecord } from '../fieldConditions';

/** One consistent view of a field for rendering. */
export interface FieldSnapshot<T = unknown> extends FieldConditionState {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  isValidating: boolean;
}

interface CacheEntry<T> {
  state: FormState;
  conditionKey: unknown;
  validating: boolean;
  snapshot: FieldSnapshot<T>;
}

/**
 * Subscribes to exactly one field: its store path (including ancestors and
 * descendants), its condition state, and its validation-in-progress flag.
 * Returns the same object until one of those changes.
 */
export function useFieldSnapshot<T = unknown>(name: string): FieldSnapshot<T> {
  const { store, schema, conditionController, isFieldValidating, subscribeFieldValidating } = useFormContext();
  const key = normalizePath(name);
  const cache = useRef<CacheEntry<T> | undefined>(undefined);

  const subscribe = useCallback((listener: () => void) => {
    const unsubscribers = [
      store.subscribeToField(dynamicPath(name), listener),
      subscribeFieldValidating(name, listener),
    ];
    if (conditionController) unsubscribers.push(conditionController.subscribe(key, listener));
    return () => { for (const unsubscribe of unsubscribers) unsubscribe(); };
  }, [conditionController, key, name, store, subscribeFieldValidating]);

  const getSnapshot = useCallback((): FieldSnapshot<T> => {
    const state = store.getState();
    const controllerState = conditionController?.getState(key);
    // With a controller, its per-field version identifies condition changes;
    // without one, conditions are derived from the (immutable) state snapshot.
    const conditionKey = conditionController ? `${conditionController.getVersion(key)}:${controllerState ? 1 : 0}` : state;
    const validating = isFieldValidating(name);
    const cached = cache.current;
    if (cached && cached.state === state && cached.conditionKey === conditionKey && cached.validating === validating) return cached.snapshot;
    const conditions = conditionController
      ? controllerState ?? DEFAULT_CONDITION_STATE
      : evaluateFieldConditions(schema, name, state.values);
    const snapshot: FieldSnapshot<T> = {
      value: store.getValue(dynamicPath(name)) as T,
      error: readPathRecord(state.errors, name),
      touched: readPathRecord(state.touched, name) ?? false,
      dirty: readPathRecord(state.dirty, name) ?? false,
      isValidating: validating,
      visible: conditions.visible,
      disabled: conditions.disabled,
      required: conditions.required,
      readOnly: conditions.readOnly,
    };
    // Keep identity when nothing this field renders has changed.
    if (cached && shallowEqual(cached.snapshot, snapshot)) {
      cache.current = { state, conditionKey, validating, snapshot: cached.snapshot };
      return cached.snapshot;
    }
    cache.current = { state, conditionKey, validating, snapshot };
    return snapshot;
  }, [conditionController, isFieldValidating, key, name, schema, store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function shallowEqual(left: object, right: object): boolean {
  const a = left as Record<string, unknown>;
  const b = right as Record<string, unknown>;
  for (const property in a) if (!Object.is(a[property], b[property])) return false;
  for (const property in b) if (!(property in a)) return false;
  return true;
}
