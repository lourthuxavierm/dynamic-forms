import { describe, expect, it, vi } from 'vitest';
import { DataSourceManager } from '../datasource';
import type { FormSchema } from '../schema';
import { FormRuntime } from './runtime';

// Regression coverage: dependencies (and conditions) must react when a watched
// path changes through an ancestor replacement or a descendant edit, for either
// array-path spelling. Schemas cannot reference indexed paths such as
// `items.0.code`; the runtime still receives indexed mutations.
const schema: FormSchema = {
  id: 'nested-triggers',
  fields: [
    { name: 'profile', type: 'object', fields: [{ name: 'address', type: 'object', fields: [{ name: 'country', type: 'select' }] }] },
    { name: 'state', type: 'select', dependsOn: ['profile.address.country'], resetOnDependencyChange: true },
    { name: 'items', type: 'array', fields: [{ name: 'code', type: 'text' }] },
    { name: 'summary', type: 'text', dependsOn: ['items'], resetOnDependencyChange: true },
    { name: 'itemNote', type: 'text', visibleWhen: { field: 'items', operator: 'exists' } },
    { name: 'domestic', type: 'text', visibleWhen: { field: 'profile.address.country', operator: 'equals', value: 'IN' } },
  ],
};

type Values = { profile: { address: { country: string } }; state: string; items: Array<{ code: string }> | null; summary: string; itemNote: string; domestic: string };
const initial = (): Values => ({ profile: { address: { country: 'IN' } }, state: 'TN', items: [{ code: 'a' }], summary: 's', itemNote: '', domestic: '' });

describe('dependencies on nested paths', () => {
  it('fires when an ancestor of the dependency is replaced', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('state', 'KA');
    runtime.setValue('profile.address', { country: 'US' });
    expect(runtime.store.getValue('state')).toBe('TN');

    runtime.setValue('state', 'KA');
    runtime.setValue('profile', { address: { country: 'FR' } });
    expect(runtime.store.getValue('state')).toBe('TN');
    runtime.dispose();
  });

  it('does not fire when an ancestor is replaced but the dependency value is unchanged', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('state', 'KA');
    runtime.setValue('profile.address', { country: 'IN' });
    expect(runtime.store.getValue('state')).toBe('KA');
    runtime.dispose();
  });

  it('fires when a descendant of the dependency changes, for both path spellings', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('summary', 'x');
    runtime.setValue('items[0].code', 'b');
    expect(runtime.store.getValue('summary')).toBe('s');

    runtime.setValue('summary', 'x');
    runtime.setValue('items.0.code', 'c');
    expect(runtime.store.getValue('summary')).toBe('s');
    runtime.dispose();
  });
});

describe('conditions on nested paths', () => {
  it('re-evaluates when an ancestor of the referenced path is replaced', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    const onChange = vi.fn();
    runtime.conditions.subscribe('domestic', onChange);

    runtime.setValue('profile.address', { country: 'US' });
    expect(runtime.conditions.getState('domestic')?.visible).toBe(false);
    expect(onChange).toHaveBeenCalledOnce();
    runtime.dispose();
  });

  it('re-evaluates when the referenced array itself is replaced', () => {
    const runtime = new FormRuntime<Values>(schema, initial());
    runtime.setValue('items', null);
    expect(runtime.conditions.getState('itemNote')?.visible).toBe(false);
    runtime.setValue('items', [{ code: 'a' }]);
    expect(runtime.conditions.getState('itemNote')?.visible).toBe(true);
    runtime.dispose();
  });
});

describe('data-source parameter paths', () => {
  it('resolves $-parameters with bracket array paths', async () => {
    const fetch = vi.fn(async () => new Response('[]', { status: 200 }));
    const manager = new DataSourceManager({ fetch: fetch as unknown as typeof globalThis.fetch });
    await manager.loadConfig('cities', { type: 'url', url: '/cities', params: { a: '$items[1].code', b: '$items.0.code' } }, { values: { items: [{ code: 'x' }, { code: 'y' }] } });
    expect(fetch).toHaveBeenCalledWith('/cities?a=y&b=x', expect.anything());
  });
});
