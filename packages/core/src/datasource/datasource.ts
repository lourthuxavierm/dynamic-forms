import type { DataSource, DataSourceConfig, DataSourceContext, DataSourceResult } from './types';

export interface DataSourceLoadOptions {
  search?: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export interface DataSourceManagerOptions {
  fetch?: typeof fetch;
}

export class DataSourceManager {
  private readonly sources = new Map<string, DataSource>();
  private readonly cache = new Map<string, unknown[]>();
  private readonly controllers = new Map<string, AbortController>();
  private readonly states = new Map<string, DataSourceResult>();
  private readonly fetchImpl: typeof fetch;

  constructor(options: DataSourceManagerOptions = {}) {
    this.fetchImpl = options.fetch ?? fetch;
  }

  register<T>(name: string, source: DataSource<T>): void { this.sources.set(name, source); }
  unregister(name: string): void { this.sources.delete(name); this.cache.delete(name); this.cancel(name); }
  has(name: string): boolean { return this.sources.has(name); }
  getState<T>(name: string): DataSourceResult<T> | undefined { return this.states.get(name) as DataSourceResult<T> | undefined; }

  async load<T>(name: string, context: DataSourceContext): Promise<T[]> {
    const source = this.sources.get(name);
    if (!source) throw new Error(`Data source "${name}" is not registered`);
    return source(context) as Promise<T[]> | T[];
  }

  async loadConfig<T>(name: string, config: DataSourceConfig<T>, context: DataSourceContext, options: DataSourceLoadOptions = {}): Promise<T[]> {
    const cacheKey = config.cacheKey ?? `${name}:${JSON.stringify({ values: context.values, search: options.search, page: options.page, pageSize: options.pageSize })}`;
    if (config.cache && this.cache.has(cacheKey)) return this.cache.get(cacheKey) as T[];

    this.cancel(name);
    const controller = options.signal ? undefined : new AbortController();
    if (controller) this.controllers.set(name, controller);
    const signal = options.signal ?? controller?.signal;
    this.states.set(name, { data: [], loading: true });
    try {
      const data = await this.resolveConfig(config, { ...context, signal }, options);
      if (config.cache) this.cache.set(cacheKey, data);
      this.states.set(name, { data, loading: false });
      return data;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      this.states.set(name, { data: [], loading: false, error: normalized });
      throw normalized;
    } finally {
      if (this.controllers.get(name) === controller) this.controllers.delete(name);
    }
  }

  cancel(name: string): void { this.controllers.get(name)?.abort(); this.controllers.delete(name); }
  clearCache(): void { this.cache.clear(); }
  clear(): void { for (const name of this.controllers.keys()) this.cancel(name); this.sources.clear(); this.cache.clear(); this.states.clear(); }

  private async resolveConfig<T>(config: DataSourceConfig<T>, context: DataSourceContext, options: DataSourceLoadOptions): Promise<T[]> {
    if (config.type === 'static') return [...(config.options ?? [])];
    if (config.type === 'url') return this.loadUrl(config, context, options);
    if (config.load) return config.load(context);
    throw new Error('Data source configuration requires load, options, or URL');
  }

  private async loadUrl<T>(config: DataSourceConfig<T>, context: DataSourceContext, options: DataSourceLoadOptions): Promise<T[]> {
    const url = new URL(config.url!, 'http://dynamic-forms.local');
    for (const [key, value] of Object.entries(config.params ?? {})) url.searchParams.set(key, resolveValue(value, context.values));
    if (options.search !== undefined && config.searchParam) url.searchParams.set(config.searchParam, options.search);
    if (options.page !== undefined && config.pageParam) url.searchParams.set(config.pageParam, String(options.page));
    if (options.pageSize !== undefined && config.pageSizeParam) url.searchParams.set(config.pageSizeParam, String(options.pageSize));
    const requestUrl = config.url!.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;
    const response = await this.fetchImpl(requestUrl, { method: config.method ?? 'GET', signal: context.signal });
    if (!response.ok) throw new Error(`Data source request failed: ${response.status}`);
    return response.json() as Promise<T[]>;
  }
}

function resolveValue(value: unknown, values: Record<string, unknown>): string {
  if (typeof value === 'string' && value.startsWith('$')) {
    const path = value.slice(1).split('.');
    const resolved = path.reduce<unknown>((current, key) => current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined, values);
    return String(resolved ?? '');
  }
  return String(value ?? '');
}
