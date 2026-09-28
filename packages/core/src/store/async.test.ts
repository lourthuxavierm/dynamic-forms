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

  it('discards a validation result after the form values change without a replacement request', async () => {
    const store = new FormStore({ email: 'first@example.com' });
    let resolveValidation!: (errors: Record<string, string>) => void;
    let validatedValues: Readonly<{ email: string }> | undefined;

    const validation = store.validate((values) => {
      validatedValues = values;
      return new Promise((resolve) => { resolveValidation = resolve; });
    });

    store.setValue('email', 'new@example.com');
    resolveValidation({ email: 'Stale error' });

    await expect(validation).resolves.toBe(true);
    expect(validatedValues).toEqual({ email: 'first@example.com' });
    expect(Object.isFrozen(validatedValues)).toBe(true);
    expect(store.getState()).toMatchObject({
      errors: {},
      valid: true,
      validating: false,
      validationError: undefined,
    });
  });

  it('does not publish a stale validation failure after a reset', async () => {
    const store = new FormStore({ email: 'first@example.com' });
    let rejectValidation!: (error: Error) => void;
    const validation = store.validate(() => new Promise((_resolve, reject) => {
      rejectValidation = reject;
    }));

    store.reset({ email: 'reset@example.com' });
    rejectValidation(new Error('Stale validation failure'));

    await expect(validation).rejects.toThrow('Stale validation failure');
    expect(store.getState()).toMatchObject({
      values: { email: 'reset@example.com' },
      valid: true,
      validating: false,
      validationError: undefined,
    });
  });
  it('accepts only one submission when submit is called twice in the same tick', async () => {
    const store = new FormStore({ name: 'Ada' });
    let resolveSubmission!: (value: string) => void;
    const onSubmit = vi.fn(() => new Promise<string>((resolve) => { resolveSubmission = resolve; }));

    const first = store.submit(onSubmit, () => ({}));
    const second = store.submit(onSubmit, () => ({}));

    await expect(second).resolves.toBeUndefined();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' });
    resolveSubmission('saved');
    await expect(first).resolves.toBe('saved');
    expect(store.getState().submitting).toBe(false);
  });

  it('validates and submits the exact same immutable snapshot', async () => {
    const store = new FormStore({ name: 'Ada' });
    let validatedValues: Readonly<{ name: string }> | undefined;
    let submittedValues: Readonly<{ name: string }> | undefined;

    await store.submit(
      (values) => { submittedValues = values; },
      (values) => { validatedValues = values; return {}; },
    );

    expect(validatedValues).toBe(submittedValues);
    expect(Object.isFrozen(submittedValues)).toBe(true);
  });
  it('does not submit a snapshot when its values changed during validation', async () => {
    const store = new FormStore({ name: 'Ada' });
    let resolveValidation!: (errors: Record<string, string>) => void;
    const onSubmit = vi.fn();
    const submission = store.submit(onSubmit, () => new Promise((resolve) => { resolveValidation = resolve; }));

    store.setValue('name', 'Grace');
    resolveValidation({});

    await expect(submission).resolves.toBeUndefined();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(store.getState().submitting).toBe(false);
  });

  it('submits the immutable snapshot captured before an onSubmit-time value change', async () => {
    const store = new FormStore({ name: 'Ada' });
    let resolveSubmission!: (value: string) => void;
    const onSubmit = vi.fn((values: Readonly<{ name: string }>) => new Promise<string>((resolve) => {
      expect(values).toEqual({ name: 'Ada' });
      expect(Object.isFrozen(values)).toBe(true);
      resolveSubmission = resolve;
    }));

    const submission = store.submit(onSubmit);
    store.setValue('name', 'Grace');
    resolveSubmission('saved');

    await expect(submission).resolves.toBe('saved');
    expect(store.getValues()).toEqual({ name: 'Grace' });
    expect(store.getState().submitting).toBe(false);
  });

  it('does not let a reset submission completion clear a newer submission lock', async () => {
    const store = new FormStore({ name: 'Ada' });
    let resolveFirst!: (value: string) => void;
    let resolveSecond!: (value: string) => void;
    const first = store.submit(() => new Promise<string>((resolve) => { resolveFirst = resolve; }));

    store.reset({ name: 'Grace' });
    const second = store.submit(() => new Promise<string>((resolve) => { resolveSecond = resolve; }));
    expect(store.getState().submitting).toBe(true);

    resolveFirst('old');
    await expect(first).resolves.toBe('old');
    expect(store.getState().submitting).toBe(true);
    resolveSecond('new');
    await expect(second).resolves.toBe('new');
    expect(store.getState().submitting).toBe(false);
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
