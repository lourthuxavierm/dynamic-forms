import { describe, expect, it, vi } from 'vitest';
import { ConditionController } from '../conditions';
import { DependencyController } from '../dependencies';
import type { FormSchema } from '../schema';
import { FormStore } from '../store';
import { FormRuntime, createFormRuntime } from './runtime';

const flush = async () => { for (let i = 0; i < 5; i += 1) await Promise.resolve(); };

const schema: FormSchema = {
  id: 'disposal',
  fields: [
    { name: 'country', type: 'select' },
    { name: 'city', type: 'select', dependsOn: ['country'], dataSource: { load: () => new Promise(() => undefined) } },
    { name: 'note', type: 'text', visibleWhen: { field: 'country', operator: 'equals', value: 'IN' } },
  ],
};

describe('FormRuntime disposal', () => {
  it('stops condition, lifecycle, diagnostic and plugin activity after dispose', () => {
    const lifecycle = vi.fn();
    const pluginLifecycle = vi.fn();
    const pluginDispose = vi.fn();
    const diagnostic = vi.fn();
    const runtime = new FormRuntime(schema, { country: 'IN', city: '', note: '' }, {
      onLifecycle: lifecycle,
      diagnostics: { enabled: true, onDiagnostic: diagnostic },
      plugins: [{ name: 'probe', onLifecycle: pluginLifecycle, dispose: pluginDispose }],
    });
    const store = runtime.store;
    const conditionListener = vi.fn();
    runtime.conditions.subscribe(conditionListener);

    runtime.dispose();
    for (const spy of [lifecycle, pluginLifecycle, diagnostic, conditionListener]) spy.mockClear();

    store.setValue('country', 'US');

    expect(pluginDispose).toHaveBeenCalledOnce();
    expect(runtime.conditions.getState('note')?.visible).toBe(true);
    expect(conditionListener).not.toHaveBeenCalled();
    expect(lifecycle).not.toHaveBeenCalled();
    expect(pluginLifecycle).not.toHaveBeenCalled();
    expect(diagnostic).not.toHaveBeenCalled();
    expect(runtime.diagnostics.getTrace()).toEqual([]);
  });

  it('aborts in-flight data-source refreshes and pending validation', async () => {
    const runtime = new FormRuntime(schema, { country: 'IN', city: '', note: '' });
    runtime.setValue('country', 'US');
    await flush();
    expect(runtime.dataSources.getState('city')?.loading).toBe(true);

    let validationSignal: AbortSignal | undefined;
    const validation = runtime.validate(async (_values, context) => {
      validationSignal = context?.signal;
      return new Promise(() => undefined);
    });
    await flush();

    runtime.dispose();
    await flush();

    expect(validationSignal?.aborted).toBe(true);
    expect(runtime.dataSources.getState('city')).toBeUndefined();
    expect(runtime.store.getState().validating).toBe(false);
    void validation.catch(() => undefined);
  });

  it('is idempotent and rejects further runtime operations', () => {
    const runtime = createFormRuntime({ id: 'idempotent', fields: [{ name: 'a', type: 'text' }] } as const);
    runtime.dispose();
    expect(() => runtime.dispose()).not.toThrow();
    expect(() => runtime.setValue('a', 'x')).toThrow('disposed');
    expect(() => runtime.explainFieldState('a')).toThrow('disposed');
    expect(() => runtime.onLifecycle(() => undefined)).toThrow('disposed');
  });
});

describe('controller disposal on a shared store', () => {
  it('leaves no condition subscriptions behind after many create/dispose cycles', () => {
    const store = new FormStore({ country: 'IN', note: '' });
    const evaluations = vi.fn();
    for (let i = 0; i < 1000; i += 1) {
      new ConditionController(store, schema, undefined, evaluations).dispose();
    }
    evaluations.mockClear();

    store.setValue('country', 'US');
    store.reset();

    expect(evaluations).not.toHaveBeenCalled();
  });

  it('leaves no dependency subscriptions behind and aborts active refreshes', async () => {
    const store = new FormStore({ country: 'IN', city: '' });
    const signals: AbortSignal[] = [];
    const evaluations = vi.fn();
    const controller = new DependencyController(store, schema, {
      onEvaluate: evaluations,
      onDataSourceRefresh: (_field, _source, _values, context) => {
        signals.push(context.signal);
        return new Promise(() => undefined);
      },
    });

    store.setValue('country', 'US');
    expect(signals).toHaveLength(1);
    controller.dispose();
    expect(signals[0].aborted).toBe(true);

    evaluations.mockClear();
    store.setValue('country', 'FR');
    await flush();
    expect(evaluations).not.toHaveBeenCalled();
    expect(signals).toHaveLength(1);
  });
});

describe('FormStore unsubscription', () => {
  it('stops every subscription kind after its cleanup runs', () => {
    const store = new FormStore({ name: '', tags: ['a'] });
    const listeners = Array.from({ length: 8 }, () => vi.fn());
    const cleanups = [
      store.subscribe(listeners[0]),
      store.subscribeToField('name', listeners[1]),
      store.subscribeSelector((state) => state.values.name, listeners[2]),
      store.subscribeToValue('name', listeners[3]),
      store.subscribeToError('name', listeners[4]),
      store.subscribeToTouched('name', listeners[5]),
      store.subscribeToDirty('name', listeners[6]),
      store.on('valueChange', listeners[7]),
    ];
    for (const cleanup of cleanups) {
      cleanup();
      cleanup();
    }

    store.setValue('name', 'Ada', { shouldTouch: true });
    store.setError('name', 'Taken');
    store.reset();

    for (const listener of listeners) expect(listener).not.toHaveBeenCalled();
  });
});
