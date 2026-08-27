import { describe, expect, it, vi } from 'vitest';
import * as core from './index';
import type { InferSchemaType } from './schema';

describe('public Core API', () => {
  it('exports the stable public modules', () => {
    expect(core.FormStore).toBeTypeOf('function');
    expect(core.validateSchema).toBeTypeOf('function');
    expect(core.createFormValidator).toBeTypeOf('function');
    expect(core.ConditionController).toBeTypeOf('function');
    expect(core.DependencyController).toBeTypeOf('function');
    expect(core.DataSourceManager).toBeTypeOf('function');
  });

  it('preserves type inference for readonly schema declarations', () => {
    const schema = {
      id: 'inference',
      fields: [{ name: 'enabled', type: 'switch' }, { name: 'count', type: 'number' }],
    } as const;
    type Values = InferSchemaType<typeof schema>;
    const values: Values = { enabled: true, count: 2 };
    expect(values).toEqual({ enabled: true, count: 2 });
  });

  it('supports unsubscribe for global and field listeners', () => {
    const store = new core.FormStore({ name: '' });
    const global = vi.fn();
    const field = vi.fn();
    const unsubscribeGlobal = store.subscribe(global);
    const unsubscribeField = store.subscribeToField('name', field);
    unsubscribeGlobal();
    unsubscribeField();

    store.setValue('name', 'Ada');

    expect(global).not.toHaveBeenCalled();
    expect(field).not.toHaveBeenCalled();
  });
});
