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
    expect(manager.getState('success')).toEqual({ data: ['ok'], loading: false });
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
    expect(manager.getState('cities')).toEqual({ data: ['New York'], loading: false });
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
});
