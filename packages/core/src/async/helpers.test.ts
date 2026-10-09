import { describe, expect, it, vi } from 'vitest';
import { AsyncRequestManager, isAbortError, normalizeAsyncError } from './manager';

describe('async helpers', () => {
  it('normalizes thrown values to Error instances', () => {
    const error = new TypeError('bad');
    expect(normalizeAsyncError(error)).toBe(error);
    expect(normalizeAsyncError('text')).toEqual(new Error('text'));
    expect(normalizeAsyncError(42).message).toBe('42');
    expect(normalizeAsyncError(undefined)).toBeInstanceOf(Error);
  });

  it('recognizes abort errors by name only', () => {
    expect(isAbortError(Object.assign(new Error('x'), { name: 'AbortError' }))).toBe(true);
    expect(isAbortError(new Error('AbortError'))).toBe(false);
    expect(isAbortError({ name: 'AbortError' })).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
  });
});

describe('AsyncRequestManager state', () => {
  it('reports idle-to-success transitions per key', async () => {
    const manager = new AsyncRequestManager<'a' | 'b'>();
    expect(manager.getState('a')).toBeUndefined();

    const result = await manager.run('a', () => 'done');
    expect(result).toMatchObject({ value: 'done', current: true });
    expect(manager.getState('a')).toEqual({ requestId: result.requestId, status: 'success', loading: false });
    const next = await manager.run('a', () => 'again');
    expect(next.requestId).toBeGreaterThan(result.requestId);
    expect(manager.getState('b')).toBeUndefined();
  });

  it('records errors for the current request and reports them once', async () => {
    const onError = vi.fn();
    const manager = new AsyncRequestManager({ onError });
    await expect(manager.run('k', () => { throw new Error('boom'); })).rejects.toThrow('boom');
    expect(manager.getState('k')).toMatchObject({ status: 'error', loading: false, error: new Error('boom') });
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(new Error('boom'), 'k', manager.getState('k')?.requestId);
  });

  it('cancelAll aborts every in-flight request', async () => {
    const manager = new AsyncRequestManager();
    const signals: AbortSignal[] = [];
    const pending = ['x', 'y'].map((key) => manager.run(key, ({ signal }) => {
      signals.push(signal);
      return new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))));
    }));

    manager.cancelAll();
    await Promise.allSettled(pending);

    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(manager.getState('x')?.status).toBe('cancelled');
    expect(manager.getState('y')?.status).toBe('cancelled');
  });

  it('clear(key) forgets state for one key; clear() forgets everything', async () => {
    const manager = new AsyncRequestManager();
    await manager.run('one', () => 1);
    await manager.run('two', () => 2);

    manager.clear('one');
    expect(manager.getState('one')).toBeUndefined();
    expect(manager.getState('two')).toBeDefined();

    manager.clear();
    expect(manager.getState('two')).toBeUndefined();
  });

  it('isCurrent tracks the latest generation per key', async () => {
    const manager = new AsyncRequestManager();
    const { requestId } = await manager.run('k', () => undefined);
    expect(manager.isCurrent('k', requestId)).toBe(true);
    manager.cancel('k');
    expect(manager.isCurrent('k', requestId)).toBe(false);
  });
});
