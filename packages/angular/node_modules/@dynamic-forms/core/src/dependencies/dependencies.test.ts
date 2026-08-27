import { describe, expect, it, vi } from 'vitest';
import { evaluateCondition } from '../conditions';
import type { FormSchema } from '../schema';
import { FormStore } from '../store';
import { DependencyController } from './controller';
import { DependencyGraph } from './graph';

describe('conditions and dependencies', () => {
  it('evaluates nested paths and compound conditions', () => {
    const values = { profile: { age: 21, roles: ['admin'] } };
    expect(evaluateCondition({
      and: [
        { field: 'profile.age', operator: 'greaterThan', value: 18 },
        { field: 'profile.roles', operator: 'contains', value: 'admin' },
      ],
      not: { field: 'profile.age', operator: 'lessThan', value: 18 },
    }, values)).toBe(true);
  });

  it('detects cycles and returns ordered transitive dependents', () => {
    const graph = new DependencyGraph([
      { field: 'state', dependsOn: ['country'] },
      { field: 'city', dependsOn: ['state'] },
    ]);
    expect(graph.getTransitiveDependents('country')).toEqual(['state', 'city']);
    expect(() => graph.setDependencies('country', ['city'])).toThrow('Dependency cycle detected');
  });

  it('resets dependent fields and refreshes their data source after upstream changes', async () => {
    const schema: FormSchema = {
      id: 'location',
      fields: [
        { name: 'country', type: 'select' },
        { name: 'state', type: 'select', dependsOn: ['country'], resetOnDependencyChange: true, dataSource: { type: 'url', url: '/states' } },
        { name: 'city', type: 'select', dependsOn: ['state'], resetOnDependencyChange: true },
      ],
    };
    const store = new FormStore({ country: 'IN', state: 'TN', city: 'Chennai' });
    const refresh = vi.fn();
    const controller = new DependencyController(store, schema, { onDataSourceRefresh: refresh });

    store.setValue('country', 'US');

    expect(store.getValue('state')).toBe('TN');
    expect(store.getValue('city')).toBe('Chennai');
    expect(refresh).toHaveBeenCalledWith(expect.objectContaining({ name: 'state' }), expect.any(Object), store.getValues());
    controller.dispose();
  });
});
