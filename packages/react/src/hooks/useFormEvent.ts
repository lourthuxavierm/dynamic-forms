import { useEffect, useRef } from 'react';
import type { FormEventListener, FormEventType } from '@dynamic-form-engine/core';
import { useFormContext } from '../context';

/**
 * Subscribe to a Core form event for the component's lifetime. The listener
 * may be an inline function: the subscription is created once per store and
 * event type and always calls the latest listener.
 */
export function useFormEvent(type: FormEventType, listener: FormEventListener): void {
  const { store } = useFormContext();
  const latest = useRef(listener);
  latest.current = listener;
  useEffect(() => store.on(type, (event) => latest.current(event)), [store, type]);
}
