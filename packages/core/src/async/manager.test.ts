import { describe, expect, it, vi } from 'vitest';
import { AsyncRequestManager } from './manager';

describe('AsyncRequestManager', () => {
  it('aborts superseded work and marks only the newest request current', async () => {
    const manager = new AsyncRequestManager<string>();
    const signals: AbortSignal[] = [];
    let resolveFirst!: (value: string) => void;
    const first = manager.run('search', ({ signal }) => {
      signals.push(signal);
      return new Promise<string>((resolve) => { resolveFirst = resolve; });
    });
    const second = manager.run('search', ({ signal }) => {
      signals.push(signal);
      return 'newest';
    });

    await expect(second).resolves.toMatchObject({ value: 'newest', current: true });
    expect(signals[0].aborted).toBe(true);
    resolveFirst('stale');
    await expect(first).resolves.toMatchObject({ value: 'stale', current: false });
    expect(manager.getState('search')).toMatchObject({ status: 'success', loading: false });
  });

  it('composes an external abort signal and centralizes current errors', async () => {
    const onError = vi.fn();
    const manager = new AsyncRequestManager<string>({ onError });
    const external = new AbortController();
    const cancelled = manager.run('remote', ({ signal }) =>
      new Promise<void>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }), { signal: external.signal });
    external.abort();

    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });
    expect(manager.getState('remote')).toMatchObject({ status: 'cancelled', loading: false });
    expect(onError).not.toHaveBeenCalled();

    await expect(manager.run('remote', () => { throw new Error('offline'); })).rejects.toThrow('offline');
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'offline' }), 'remote', expect.any(Number));
  });
});
