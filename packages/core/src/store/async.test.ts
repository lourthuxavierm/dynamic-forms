import { describe, expect, it, vi } from 'vitest';
import { FormStore } from './store';

describe('FormStore asynchronous validation', () => {
  it('uses last-write-wins semantics for validation results', async () => {
    const store = new FormStore({ email: 'first@example.com' });
    let resolveFirst!: (errors: Record<string, string>) => void;
    let firstSignal: AbortSignal | undefined;
    const first = store.validate((_values, context) => {
      firstSignal = context?.signal;
      return new Promise((resolve) => { resolveFirst = resolve; });
    });

    store.setValue('email', 'new@example.com');
    const second = store.validate(async () => ({}));
    await expect(second).resolves.toBe(true);
    expect(firstSignal?.aborted).toBe(true);

    resolveFirst({ email: 'Stale error' });
    await first;
    expect(store.getState()).toMatchObject({
      errors: {},
      valid: true,
      validating: false,
      validationError: undefined,
    });
  });

  it('tracks loading and failures and supports explicit cancellation', async () => {
    const onAsyncError = vi.fn();
    const store = new FormStore({ value: '' }, { onAsyncError });
    let rejectValidation!: (error: Error) => void;
    const failure = store.validate(() => new Promise((_resolve, reject) => {
      rejectValidation = reject;
    }));
    expect(store.getState().validating).toBe(true);
    rejectValidation(new Error('validation service unavailable'));
    await expect(failure).rejects.toThrow('validation service unavailable');
    expect(store.getState()).toMatchObject({
      validating: false,
      validationError: expect.objectContaining({ message: 'validation service unavailable' }),
    });
    expect(onAsyncError).toHaveBeenCalledOnce();

    let signal: AbortSignal | undefined;
    const cancelled = store.validate((_values, context) => {
      signal = context?.signal;
      return new Promise((_resolve, reject) => {
        context?.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });
    store.cancelValidation();
    expect(signal?.aborted).toBe(true);
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });
    expect(store.getState()).toMatchObject({ validating: false, validationError: undefined });
  });
});
