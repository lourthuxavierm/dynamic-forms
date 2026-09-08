import type { AsyncRequestContext, AsyncRequestStatus } from '../async';

export interface DataSourceContext extends Partial<AsyncRequestContext> {
  values: Record<string, unknown>;
  field?: string;
}

export interface DataSourceResult<T = unknown> {
  data: T[];
  loading: boolean;
  /** Present on manager-owned request state; optional for adapter-local initial state. */
  status?: AsyncRequestStatus;
  /** Present on manager-owned request state; optional for adapter-local initial state. */
  requestId?: number;
  error?: Error;
}

export type DataSource<T = unknown> = (context: DataSourceContext) => Promise<T[]> | T[];

export interface DataSourceConfig<T = unknown> {
  type?: 'function' | 'static' | 'url';
  load?: DataSource<T>;
  options?: readonly T[];
  url?: string;
  method?: 'GET' | 'POST';
  params?: Record<string, unknown>;
  searchParam?: string;
  pageParam?: string;
  pageSizeParam?: string;
  cache?: boolean;
  cacheKey?: string;
}
