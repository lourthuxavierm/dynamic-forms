import { describe, expect, it, vi } from 'vitest';
import { DataSourceManager } from './datasource';

describe('DataSourceManager', () => {
  it('loads static and function data sources, caching configured results', async () => {
    const manager = new DataSourceManager();
    const loader = vi.fn(async () => ['India']);
    await expect(manager.loadConfig('static', { type: 'static', options: ['India'] }, { values: {} })).resolves.toEqual(['India']);
    await manager.loadConfig('countries', { type: 'function', load: loader, cache: true, cacheKey: 'countries' }, { values: {} });
    await manager.loadConfig('countries', { type: 'function', load: loader, cache: true, cacheKey: 'countries' }, { values: {} });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('resolves URL parameters, search, and pagination', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify(['Tamil Nadu']), { status: 200 }));
    const manager = new DataSourceManager({ fetch });
    await expect(manager.loadConfig('states', {
      type: 'url', url: '/api/states', params: { country: '$country' }, searchParam: 'q', pageParam: 'page', pageSizeParam: 'limit',
    }, { values: { country: 'IN' } }, { search: 'tam', page: 2, pageSize: 10 })).resolves.toEqual(['Tamil Nadu']);
    expect(fetch).toHaveBeenCalledWith('/api/states?country=IN&q=tam&page=2&limit=10', expect.objectContaining({ method: 'GET' }));
  });

  it('exposes success and error state for configured loads', async () => {
    const manager = new DataSourceManager();
    await manager.loadConfig('success', { type: 'static', options: ['ok'] }, { values: {} });
    expect(manager.getState('success')).toMatchObject({ data: ['ok'], loading: false, status: 'success' });
    await expect(manager.loadConfig('failure', { type: 'function', load: async () => { throw new Error('unavailable'); } }, { values: {} })).rejects.toThrow('unavailable');
    expect(manager.getState('failure')).toMatchObject({ loading: false, error: expect.objectContaining({ message: 'unavailable' }) });
  });

  it('keeps the newest request state when responses resolve out of order', async () => {
    let resolveFirst!: (value: string[]) => void;
    let resolveSecond!: (value: string[]) => void;
    const first = new Promise<string[]>((resolve) => { resolveFirst = resolve; });
    const second = new Promise<string[]>((resolve) => { resolveSecond = resolve; });
    let call = 0;
    const manager = new DataSourceManager();
    const config = { type: 'function' as const, load: () => ++call === 1 ? first : second };
    const stale = manager.loadConfig('cities', config, { values: { country: 'IN' } });
    const current = manager.loadConfig('cities', config, { values: { country: 'US' } });
    resolveSecond(['New York']);
    await current;
    resolveFirst(['Delhi']);
    await stale;
    expect(manager.getState('cities')).toMatchObject({ data: ['New York'], loading: false, status: 'success' });
  });

  it('aborts an active request and clears loading state', async () => {
    const manager = new DataSourceManager();
    let signal: AbortSignal | undefined;
    const request = manager.loadConfig('abortable', {
      type: 'function',
      load: (context) => {
        signal = context.signal;
        return new Promise<string[]>((_resolve, reject) => context.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
      },
    }, { values: {} });
    manager.cancel('abortable');
    expect(signal?.aborted).toBe(true);
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(manager.getState('abortable')?.loading).toBe(false);
  });

  it('cancels rapid searches and never caches a stale response', async () => {
    const signals: AbortSignal[] = [];
    let resolveFirst!: (value: string[]) => void;
    const firstResult = new Promise<string[]>((resolve) => { resolveFirst = resolve; });
    let call = 0;
    const loader = vi.fn(({ signal }: { signal?: AbortSignal }) => {
      if (signal) signals.push(signal);
      return ++call === 1 ? firstResult : Promise.resolve(['new']);
    });
    const manager = new DataSourceManager();
    const config = { type: 'function' as const, load: loader, cache: true };

    const stale = manager.loadConfig('search', config, { values: {} }, { search: 'a' });
    const current = manager.loadConfig('search', config, { values: {} }, { search: 'ab' });
    await expect(current).resolves.toEqual(['new']);
    expect(signals[0].aborted).toBe(true);
    resolveFirst(['old']);
    await stale;

    await manager.loadConfig('search', config, { values: {} }, { search: 'a' });
    expect(loader).toHaveBeenCalledTimes(3);
    expect(manager.getState('search')).toMatchObject({ data: ['new'], status: 'success' });
  });

  it('aborts an active request when its field data source is unregistered', async () => {
    let signal: AbortSignal | undefined;
    const manager = new DataSourceManager();
    manager.register('removed-field', (context) => {
      signal = context.signal;
      return new Promise<string[]>((_resolve, reject) => {
        context.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });
    const request = manager.load<string>('removed-field', { values: {} });
    manager.unregister('removed-field');

    expect(signal?.aborted).toBe(true);
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(manager.getState('removed-field')).toBeUndefined();
  });

  it('reports current failures through the centralized error hook', async () => {
    const onError = vi.fn();
    const manager = new DataSourceManager({ onError });
    await expect(manager.loadConfig(
      'remote',
      { type: 'function', load: () => { throw 'offline'; } },
      { values: {} },
    )).rejects.toThrow('offline');

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'offline' }),
      'remote',
      expect.any(Number),
    );
  });
});
