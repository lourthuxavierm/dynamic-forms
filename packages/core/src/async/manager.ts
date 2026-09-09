import type {
  AsyncRequestContext,
  AsyncRequestManagerOptions,
  AsyncRequestResult,
  AsyncRequestState,
  AsyncRunOptions,
} from './types';

interface ActiveRequest {
  requestId: number;
  controller: AbortController;
  unlinkExternalSignal?: () => void;
}

export class AsyncRequestManager<TKey = string> {
  private readonly active = new Map<TKey, ActiveRequest>();
  private readonly generations = new Map<TKey, number>();
  private readonly states = new Map<TKey, AsyncRequestState>();
  private readonly onError?: AsyncRequestManagerOptions<TKey>['onError'];

  constructor(options: AsyncRequestManagerOptions<TKey> = {}) {
    this.onError = options.onError;
  }

  getState(key: TKey): AsyncRequestState | undefined {
    return this.states.get(key);
  }

  isCurrent(key: TKey, requestId: number): boolean {
    return this.generations.get(key) === requestId;
  }

  async run<T>(
    key: TKey,
    operation: (context: AsyncRequestContext) => T | Promise<T>,
    options: AsyncRunOptions = {},
  ): Promise<AsyncRequestResult<T>> {
    this.cancel(key);
    const requestId = (this.generations.get(key) ?? 0) + 1;
    this.generations.set(key, requestId);
    const controller = new AbortController();
    const unlinkExternalSignal = linkAbortSignal(options.signal, controller);
    this.active.set(key, { requestId, controller, unlinkExternalSignal });
    this.states.set(key, { requestId, status: 'loading', loading: true });

    try {
      const value = await operation({ requestId, signal: controller.signal });
      const current = this.isCurrent(key, requestId);
      if (current) {
        this.states.set(key, { requestId, status: 'success', loading: false });
      }
      return { requestId, value, current };
    } catch (error) {
      const normalized = normalizeAsyncError(error);
      const current = this.isCurrent(key, requestId);
      if (current) {
        const cancelled = controller.signal.aborted || normalized.name === 'AbortError';
        this.states.set(key, {
          requestId,
          status: cancelled ? 'cancelled' : 'error',
          loading: false,
          ...(cancelled ? {} : { error: normalized }),
        });
        if (!cancelled) this.onError?.(normalized, key, requestId);
      }
      throw normalized;
    } finally {
      const active = this.active.get(key);
      if (active?.requestId === requestId) {
        active.unlinkExternalSignal?.();
        this.active.delete(key);
      }
    }
  }

  cancel(key: TKey): void {
    const active = this.active.get(key);
    if (active) {
      active.controller.abort();
      active.unlinkExternalSignal?.();
      this.active.delete(key);
    }
    const requestId = (this.generations.get(key) ?? 0) + 1;
    this.generations.set(key, requestId);
    const previous = this.states.get(key);
    if (previous?.loading) {
      this.states.set(key, { requestId, status: 'cancelled', loading: false });
    }
  }

  cancelAll(): void {
    for (const key of [...this.active.keys()]) this.cancel(key);
  }

  clear(key?: TKey): void {
    if (key !== undefined) {
      this.cancel(key);
      this.states.delete(key);
      return;
    }
    this.cancelAll();
    this.states.clear();
  }
}

export function normalizeAsyncError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function linkAbortSignal(signal: AbortSignal | undefined, controller: AbortController): (() => void) | undefined {
  if (!signal) return undefined;
  if (signal.aborted) {
    controller.abort(signal.reason);
    return undefined;
  }
  const abort = () => controller.abort(signal.reason);
  signal.addEventListener('abort', abort, { once: true });
  return () => signal.removeEventListener('abort', abort);
}
