export interface DataSourceContext {
  values: Record<string, unknown>;
  field?: string;
  signal?: AbortSignal;
}

export interface DataSourceResult<T = unknown> {
  data: T[];
  loading: boolean;
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
