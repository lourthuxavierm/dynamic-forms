import { AsyncRequestManager, isAbortError, normalizeAsyncError } from '../async';
import type { AsyncRequestResult } from '../async';
import type { DataSource, DataSourceConfig, DataSourceContext, DataSourceResult } from './types';

export interface DataSourceLoadOptions {
  search?: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export interface DataSourceManagerOptions {
  fetch?: typeof fetch;
  onError?: (error: Error, name: string, requestId: number) => void;
}

export class DataSourceManager {
  private readonly sources = new Map<string, DataSource>();
  private readonly cache = new Map<string, unknown[]>();
  private readonly requests: AsyncRequestManager<string>;
  private readonly states = new Map<string, DataSourceResult>();
  private readonly fetchImpl: typeof fetch;

  constructor(options: DataSourceManagerOptions = {}) {
    this.fetchImpl = options.fetch ?? fetch;
    this.requests = new AsyncRequestManager({ onError: options.onError });
  }

  register<T>(name: string, source: DataSource<T>): void {
    this.sources.set(name, source);
  }

  unregister(name: string): void {
    this.sources.delete(name);
    this.cache.delete(name);
    this.cancel(name);
    this.states.delete(name);
  }

  has(name: string): boolean {
    return this.sources.has(name);
  }

  getState<T>(name: string): DataSourceResult<T> | undefined {
    return this.states.get(name) as DataSourceResult<T> | undefined;
  }

  async load<T>(name: string, context: DataSourceContext): Promise<T[]> {
    const source = this.sources.get(name);
    if (!source) throw new Error(`Data source "${name}" is not registered`);
    const result = await this.execute(name, context, {}, (requestContext) =>
      source({ ...context, ...requestContext }) as Promise<T[]> | T[]);
    return result.value;
  }

  async loadConfig<T>(
    name: string,
    config: DataSourceConfig<T>,
    context: DataSourceContext,
    options: DataSourceLoadOptions = {},
  ): Promise<T[]> {
    const cacheKey = config.cacheKey ?? `${name}:${JSON.stringify({
      values: context.values,
      search: options.search,
      page: options.page,
      pageSize: options.pageSize,
    })}`;
    if (config.cache && this.cache.has(cacheKey)) {
      this.cancel(name);
      const cached = this.cache.get(cacheKey) as T[];
      const requestId = this.requests.getState(name)?.requestId ?? 0;
      this.states.set(name, { data: cached, loading: false, status: 'success', requestId });
      return cached;
    }

    const result = await this.execute(name, context, options, (requestContext) =>
      this.resolveConfig(config, { ...context, ...requestContext }, options));
    if (config.cache && result.current) this.cache.set(cacheKey, result.value);
    return result.value;
  }

  cancel(name: string): void {
    this.requests.cancel(name);
    const request = this.requests.getState(name);
    const current = this.states.get(name);
    if (current?.loading && request) {
      this.states.set(name, {
        ...current,
        requestId: request.requestId,
        loading: false,
        status: 'cancelled',
        error: undefined,
      });
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clear(): void {
    this.requests.clear();
    this.sources.clear();
    this.cache.clear();
    this.states.clear();
  }

  private async execute<T>(
    name: string,
    context: DataSourceContext,
    options: DataSourceLoadOptions,
    operation: (request: { requestId: number; signal: AbortSignal }) => T[] | Promise<T[]>,
  ): Promise<AsyncRequestResult<T[]>> {
    const previousData = (this.states.get(name)?.data ?? []) as T[];
    const requestPromise = this.requests.run(name, operation, { signal: options.signal ?? context.signal });
    const started = this.requests.getState(name)!;
    this.states.set(name, {
      data: previousData,
      loading: true,
      status: 'loading',
      requestId: started.requestId,
    });

    try {
      const result = await requestPromise;
      if (result.current) {
        this.states.set(name, {
          data: result.value,
          loading: false,
          status: 'success',
          requestId: result.requestId,
        });
      }
      return result;
    } catch (error) {
      const normalized = normalizeAsyncError(error);
      const state = this.requests.getState(name);
      if (state?.requestId === started.requestId) {
        this.states.set(name, {
          data: previousData,
          loading: false,
          status: isAbortError(normalized) || state.status === 'cancelled' ? 'cancelled' : 'error',
          requestId: started.requestId,
          ...(isAbortError(normalized) || state.status === 'cancelled' ? {} : { error: normalized }),
        });
      }
      throw normalized;
    }
  }

  private async resolveConfig<T>(
    config: DataSourceConfig<T>,
    context: DataSourceContext,
    options: DataSourceLoadOptions,
  ): Promise<T[]> {
    if (config.type === 'static') return [...(config.options ?? [])];
    if (config.type === 'url') return this.loadUrl(config, context, options);
    if (config.load) return config.load(context);
    throw new Error('Data source configuration requires load, options, or URL');
  }

  private async loadUrl<T>(
    config: DataSourceConfig<T>,
    context: DataSourceContext,
    options: DataSourceLoadOptions,
  ): Promise<T[]> {
    const url = new URL(config.url!, 'http://dynamic-forms.local');
    for (const [key, value] of Object.entries(config.params ?? {})) {
      url.searchParams.set(key, resolveValue(value, context.values));
    }
    if (options.search !== undefined && config.searchParam) url.searchParams.set(config.searchParam, options.search);
    if (options.page !== undefined && config.pageParam) url.searchParams.set(config.pageParam, String(options.page));
    if (options.pageSize !== undefined && config.pageSizeParam) {
      url.searchParams.set(config.pageSizeParam, String(options.pageSize));
    }
    const requestUrl = config.url!.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;
    const response = await this.fetchImpl(requestUrl, {
      method: config.method ?? 'GET',
      signal: context.signal,
    });
    if (!response.ok) throw new Error(`Data source request failed: ${response.status}`);
    return response.json() as Promise<T[]>;
  }
}

function resolveValue(value: unknown, values: Record<string, unknown>): string {
  if (typeof value === 'string' && value.startsWith('$')) {
    const path = value.slice(1).split('.');
    const resolved = path.reduce<unknown>(
      (current, key) => current && typeof current === 'object'
        ? (current as Record<string, unknown>)[key]
        : undefined,
      values,
    );
    return String(resolved ?? '');
  }
  return String(value ?? '');
}
