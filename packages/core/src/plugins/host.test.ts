import { describe, expect, it, vi } from 'vitest';
import { CorePluginHost } from './host';
import type { CorePluginContext } from './types';

const context = Object.freeze({
  schema: Object.freeze({ id: 'host', fields: [] }),
  getState: () => ({ values: {} }),
  getConditionState: () => undefined,
  getDataSourceState: () => undefined,
}) as unknown as CorePluginContext<Record<string, unknown>>;

describe('CorePluginHost (direct composition)', () => {
  it('rejects unnamed and duplicate plugins without activating them', () => {
    const onError = vi.fn();
    const setup = vi.fn();
    new CorePluginHost([{ name: '', setup }, { name: 'a', setup }, { name: 'a', setup }], context, onError);
    expect(setup).toHaveBeenCalledOnce();
    expect(onError.mock.calls.map(([failure]) => failure.error.message)).toEqual(['Plugin name is required.', 'Duplicate plugin name: a']);
  });

  it('stops delivering lifecycle events and interceptions after dispose', () => {
    const onLifecycle = vi.fn();
    const interceptMutation = vi.fn(() => ({ cancel: true as const }));
    const host = new CorePluginHost([{ name: 'p', onLifecycle, interceptMutation }], context);
    host.dispose();
    host.dispose();

    host.emitLifecycle({ phase: 'mutation', async: false });
    const result = host.interceptMutation({ type: 'setValue', path: 'a', value: 1 });

    expect(onLifecycle).not.toHaveBeenCalled();
    expect(interceptMutation).not.toHaveBeenCalled();
    expect(result).toEqual({ type: 'setValue', path: 'a', value: 1 });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('rejects interceptors that change the mutation type', () => {
    const onError = vi.fn();
    const host = new CorePluginHost([{ name: 'bad', interceptMutation: () => ({ type: 'reset' }) as never }], context, onError);
    const result = host.interceptMutation({ type: 'setValue', path: 'a', value: 1 });
    expect(result).toMatchObject({ type: 'setValue', value: 1 });
    expect(onError.mock.calls[0][0]).toMatchObject({ plugin: 'bad', hook: 'interceptMutation' });
  });
});
