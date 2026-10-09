import { useMemo } from 'react';
import { useFieldSnapshot } from './fieldSnapshot';

/**
 * Error, touched, dirty, validation progress, and Core condition state
 * (visible, disabled, required, read-only) for one field, without its value
 * or actions. Condition state is correct on the first render and during
 * server rendering, before the provider's condition controller mounts.
 */
export function useFieldState(name: string) {
  const snapshot = useFieldSnapshot(name);
  return useMemo(() => ({
    error: snapshot.error,
    touched: snapshot.touched,
    dirty: snapshot.dirty,
    isValidating: snapshot.isValidating,
    visible: snapshot.visible,
    disabled: snapshot.disabled,
    required: snapshot.required,
    readOnly: snapshot.readOnly,
  }), [snapshot]);
}
