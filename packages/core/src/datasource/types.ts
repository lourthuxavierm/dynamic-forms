export interface DataSourceContext {
  values: Record<string, unknown>;
  field?: string;
}

export interface DataSourceResult<T = unknown> {
  data: T[];
  loading: boolean;
  error?: Error;
}

export type DataSource<T = unknown> = (
  context: DataSourceContext
) => Promise<T[]> | T[];

export interface DataSourceConfig<T = unknown> {
  load: DataSource<T>;
  cache?: boolean;
  cacheKey?: string;
}
