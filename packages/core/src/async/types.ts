export interface AsyncRequestContext {
  /** Monotonically increasing identifier scoped to an operation key. */
  requestId: number;
  /** Aborts when the request is superseded, explicitly cancelled, or externally aborted. */
  signal: AbortSignal;
}

export type AsyncRequestStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';

export interface AsyncRequestState {
  requestId: number;
  status: AsyncRequestStatus;
  loading: boolean;
  error?: Error;
}

export interface AsyncRequestResult<T> {
  requestId: number;
  value: T;
  current: boolean;
}

export interface AsyncRequestManagerOptions<TKey> {
  onError?: (error: Error, key: TKey, requestId: number) => void;
}

export interface AsyncRunOptions {
  signal?: AbortSignal;
}
