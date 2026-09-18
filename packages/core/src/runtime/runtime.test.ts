import { describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '../schema';
import { FormRuntime } from './runtime';
import type { RuntimeLifecyclePhase } from './types';

const schema: FormSchema = {
  id: 'runtime-lifecycle',
  fields: [
    { name: 'country', type: 'select' },
    {
      name: 'state',
      type: 'select',
      dependsOn: ['country'],
      resetOnDependencyChange: true,
      dataSource: { type: 'static', options: ['TN', 'KA'] },
    },
    { name: 'showDetails', type: 'checkbox' },
    {
      name: 'details',
      type: 'text',
      hiddenValuePolicy: 'clear',
      visibleWhen: { field: 'showDetails', operator: 'equals', value: true },
    },
  ],
};

describe('FormRuntime lifecycle', () => {
  it('preserves nested schema defaults under initial values and replacement resets', () => {
    type Values = { profile: { name: string; city: string } };
    const runtime = new FormRuntime<Values>({ id: 'nested-runtime', fields: [{ name: 'profile', type: 'object', fields: [{ name: 'name', type: 'text', defaultValue: 'Anonymous' }, { name: 'city', type: 'text', defaultValue: 'Chennai' }] }] }, { profile: { name: 'Ada' } } as Values);
    expect(runtime.store.getValues()).toEqual({ profile: { name: 'Ada', city: 'Chennai' } });
    runtime.reset({ profile: { city: 'Pune' } } as Values);
    expect(runtime.store.getValues()).toEqual({ profile: { name: 'Anonymous', city: 'Pune' } });
    runtime.dispose();
  });
  it('uses deterministic sync ordering and starts data-source work after notification', async () => {
    const phases: RuntimeLifecyclePhase[] = [];
    const runtime = new FormRuntime(
      schema,
      { country: 'IN', state: 'TN', showDetails: true, details: 'secret' },
      { onLifecycle: (event) => phases.push(event.phase) },
    );

    runtime.setValue('country', 'US');
    await Promise.resolve();
    await Promise.resolve();

    expect(phases.indexOf('mutation')).toBeLessThan(phases.indexOf('dependencies'));
    expect(phases.indexOf('dependencies')).toBeLessThan(phases.indexOf('conditions'));
    expect(phases.indexOf('conditions')).toBeLessThan(phases.indexOf('events'));
    expect(phases.indexOf('events')).toBeLessThan(phases.indexOf('notification'));
    expect(phases.indexOf('notification')).toBeLessThan(phases.indexOf('dataSource'));
    runtime.dispose();
  });

  it('settles condition side effects before one standalone-mutation notification', () => {
    const runtime = new FormRuntime(
      schema,
      { country: 'IN', state: 'TN', showDetails: true, details: 'secret' },
    );
    const observed = vi.fn();
    runtime.store.subscribe((state) => observed(state.values));

    runtime.setValue('showDetails', false);

    expect(observed).toHaveBeenCalledOnce();
    expect(observed).toHaveBeenCalledWith({
      country: 'IN',
      state: 'TN',
      showDetails: false,
      details: undefined,
    });
    runtime.dispose();
  });

  it('defines validation as an explicit async phase before validation events', async () => {
    const phases: string[] = [];
    const runtime = new FormRuntime(schema, {
      country: 'IN',
      state: 'TN',
      showDetails: true,
      details: '',
    });
    runtime.onLifecycle((event) => {
      phases.push(event.phase === 'events' && event.formEvent?.type === 'validate'
        ? 'validation-event'
        : event.phase);
    });

    await runtime.validate(async () => ({ details: 'Required' }));

    expect(phases[0]).toBe('validation');
    expect(phases).toContain('validation-event');
    expect(runtime.store.getState()).toMatchObject({ valid: false, validating: false });
    runtime.dispose();
  });

  it('rejects dependency cycles during runtime construction', () => {
    const cyclic: FormSchema = {
      id: 'cycle',
      fields: [
        { name: 'a', type: 'text', dependsOn: ['b'] },
        { name: 'b', type: 'text', dependsOn: ['a'] },
      ],
    };

    expect(() => new FormRuntime(cyclic, { a: '', b: '' })).toThrow(
      'Dependency cycle detected',
    );
  });

  it('stops recursive event mutations at the configured safety limit', () => {
    const runtime = new FormRuntime(
      { id: 'recursive', fields: [{ name: 'count', type: 'number' }] },
      { count: 0 },
      { store: { maxLifecycleIterations: 6 } },
    );
    runtime.store.on('valueChange', (event) => {
      runtime.store.setValue('count', event.value === 1 ? 2 : 1);
    });

    expect(() => runtime.setValue('count', 1)).toThrow(
      'Lifecycle processing exceeded maxLifecycleIterations',
    );
    runtime.dispose();
  });

  it('disposes subscriptions and rejects later runtime operations', () => {
    const lifecycle = vi.fn();
    const runtime = new FormRuntime(
      schema,
      { country: 'IN', state: 'TN', showDetails: true, details: '' },
      { onLifecycle: lifecycle },
    );
    runtime.dispose();
    runtime.dispose();

    expect(() => runtime.setValue('country', 'US')).toThrow('FormRuntime has been disposed');
  });
});
