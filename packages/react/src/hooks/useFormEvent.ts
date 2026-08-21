import { useEffect } from 'react';
import type { FormEventListener, FormEventType } from '@dynamic-forms/core';
import { useFormContext } from '../context';

/** Subscribe to a Core form event; cleanup is handled with the component lifecycle. */
export function useFormEvent(type: FormEventType, listener: FormEventListener): void {
  const { store } = useFormContext();
  useEffect(() => store.on(type, listener), [listener, store, type]);
}