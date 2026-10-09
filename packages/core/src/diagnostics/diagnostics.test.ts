import { describe, expect, it, vi } from 'vitest';
import { DataSourceManager, type DataSourceRequestEvent } from '../datasource';
import { FormRuntime } from '../runtime';
import type { FormSchema } from '../schema';
import type { RuntimeDiagnosticEvent } from './types';

const flush = async () => { for (let i = 0; i < 5; i += 1) await Promise.resolve(); };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

const schema: FormSchema = {
  id: 'diagnostics',
  fields: [
    { name: 'customerType', type: 'select' },
    { name: 'country', type: 'select' },
    {
      name: 'companyName',
      type: 'text',
      label: 'Company name',
      visibleWhen: { field: 'customerType', operator: 'equals', value: 'business' },
      requiredWhen: { field: 'country', operator: 'equals', value: 'IN' },
      validation: { minLength: 3 },
      hiddenValuePolicy: 'clear',
    },
    { name: 'taxId', type: 'text', disabled: true, readOnlyWhen: { field: 'country', operator: 'equals', value: 'US' } },
    { name: 'email', type: 'email', validation: { required: true } },
    { name: 'state', type: 'select', dependsOn: ['country'], resetOnDependencyChange: true },
  ],
};

const values = () => ({ customerType: 'individual', country: 'IN', companyName: '', taxId: '', email: '', state: 'TN' });

describe('FormRuntime diagnostics — explainFieldState', () => {
  it('explains why a field is hidden, down to the failing rule', () => {
    const runtime = new FormRuntime(schema, values());
    const explanation = runtime.explainFieldState('companyName');

    expect(explanation.exists).toBe(true);
    expect(explanation.visible).toMatchObject({ value: false, reason: 'visibleWhen' });
    expect(explanation.visible.condition?.decisive[0]).toMatchObject({ field: 'customerType', operator: 'equals', expected: 'business', actualType: 'string' });
    runtime.dispose();
  });

  it('explains static and conditional disabled, read-only and required flags', () => {
    const runtime = new FormRuntime(schema, values());

    expect(runtime.explainFieldState('taxId').disabled).toEqual({ value: true, reason: 'static' });
    expect(runtime.explainFieldState('taxId').readOnly).toMatchObject({ value: false, reason: 'readOnlyWhen' });
    expect(runtime.explainFieldState('email').required).toEqual({ value: true, reason: 'validation.required' });
    expect(runtime.explainFieldState('companyName').required).toMatchObject({ value: true, reason: 'requiredWhen' });
    expect(runtime.explainFieldState('country').visible).toEqual({ value: true, reason: 'default' });
    runtime.dispose();
  });

  it('identifies which schema rule produced the current error', async () => {
    const runtime = new FormRuntime(schema, { ...values(), customerType: 'business', companyName: 'ab' });
    runtime.store.setError('companyName', 'Company name must be at least 3 characters');

    const validation = runtime.explainFieldState('companyName').validation;
    expect(validation).toMatchObject({ source: 'schema', rule: 'minLength', skippedBecauseHidden: false });
    expect(validation.rules).toEqual(['required', 'minLength']);
    expect(validation.failingRules).toEqual(['minLength']);
    runtime.dispose();
  });

  it('marks errors that no schema rule produced as external', () => {
    const runtime = new FormRuntime(schema, { ...values(), email: 'ada@example.com' });
    runtime.store.setError('email', 'Email already registered');

    expect(runtime.explainFieldState('email').validation).toMatchObject({ error: 'Email already registered', source: 'external' });
    expect(runtime.explainFieldState('email').validation).not.toHaveProperty('rule');
    runtime.dispose();
  });

  it('reports unknown paths without throwing', () => {
    const runtime = new FormRuntime(schema, values());
    const explanation = runtime.explainFieldState('missing');
    expect(explanation.exists).toBe(false);
    expect(explanation.validation.rules).toEqual([]);
    runtime.dispose();
  });

  it('does not include field values unless requested', () => {
    const runtime = new FormRuntime(schema, values());
    const redacted = runtime.explainFieldState('companyName');
    expect(redacted.visible.condition?.decisive[0]).not.toHaveProperty('actual');

    const revealed = runtime.explainFieldState('companyName', { includeValues: true });
    expect(revealed.visible.condition?.decisive[0].actual).toBe('individual');
    runtime.dispose();
  });
});

describe('FormRuntime diagnostics — trace', () => {
  it('records nothing by default', () => {
    const runtime = new FormRuntime(schema, values());
    runtime.setValue('customerType', 'business');
    expect(runtime.diagnostics.enabled).toBe(false);
    expect(runtime.diagnostics.getTrace()).toEqual([]);
    runtime.dispose();
  });

  it('links a condition change to the value change that caused it', () => {
    const runtime = new FormRuntime(schema, values(), { diagnostics: { enabled: true } });
    runtime.setValue('customerType', 'business');

    const [change] = runtime.diagnostics.getTrace({ type: 'valueChange', path: 'customerType' });
    const transition = runtime.diagnostics.getTrace({ type: 'conditionChange', path: 'companyName' }).at(-1)!;
    expect(change).toMatchObject({ type: 'valueChange', path: 'customerType', origin: 'api' });
    expect(transition).toMatchObject({
      path: 'companyName',
      changed: ['visible'],
      state: { visible: true },
      previous: { visible: false },
      cause: { type: 'valueChange', path: 'customerType', sequence: change.sequence },
    });
    expect(transition.sequence).toBeGreaterThan(change.sequence);
    expect(runtime.explainFieldState('companyName').lastConditionChange?.sequence).toBe(transition.sequence);
    runtime.dispose();
  });

  it('records which dependency caused a refresh', () => {
    const runtime = new FormRuntime(schema, values(), { diagnostics: { enabled: true } });
    runtime.setValue('country', 'US');

    const refresh = runtime.explainFieldState('state').dependencies.lastRefresh;
    expect(runtime.explainFieldState('state').dependencies.dependsOn).toEqual(['country']);
    expect(refresh).toMatchObject({ type: 'dependencyRefresh', path: 'state', action: 'reset', via: ['country'], cause: { type: 'valueChange', path: 'country' } });
    runtime.dispose();
  });

  it('records hidden-value clears with their origin', () => {
    const runtime = new FormRuntime(schema, { ...values(), customerType: 'business', companyName: 'Acme' }, { diagnostics: { enabled: true } });
    runtime.setValue('customerType', 'individual');

    const clears = runtime.diagnostics.getTrace({ type: 'valueChange', path: 'companyName' });
    expect(clears).toHaveLength(1);
    expect(clears[0]).toMatchObject({ origin: 'hiddenValuePolicy', valueType: 'undefined', previousValueType: 'string' });
    expect(runtime.diagnostics.getTrace({ type: 'conditionChange', path: 'companyName' }).at(-1)).toMatchObject({ hiddenValuePolicy: 'clear', cause: { type: 'valueChange', path: 'customerType' } });
    runtime.setValue('customerType', 'business');
    runtime.setValue('companyName', 'Beta');
    expect(runtime.diagnostics.getTrace({ type: 'valueChange', path: 'companyName' }).at(-1)).toMatchObject({ origin: 'api' });
    runtime.dispose();
  });

  it('records validation outcomes without error messages', async () => {
    const runtime = new FormRuntime(schema, values(), { diagnostics: { enabled: true } });
    await runtime.validate(async () => ({ email: 'Email is required' }));

    const [validation] = runtime.diagnostics.getTrace({ type: 'validation' });
    expect(validation).toMatchObject({ valid: false, errorPaths: ['email'] });
    expect(JSON.stringify(validation)).not.toContain('Email is required');
    runtime.dispose();
  });

  it('redacts values in the trace unless includeValues is enabled', () => {
    const redacted = new FormRuntime(schema, values(), { diagnostics: { enabled: true } });
    redacted.setValue('email', 'ada@example.com');
    expect(JSON.stringify(redacted.diagnostics.getTrace())).not.toContain('ada@example.com');
    redacted.dispose();

    const revealed = new FormRuntime(schema, values(), { diagnostics: { enabled: true, includeValues: true } });
    revealed.setValue('email', 'ada@example.com');
    expect(revealed.diagnostics.getTrace({ type: 'valueChange', path: 'email' })[0]).toMatchObject({ value: 'ada@example.com', previousValue: '' });
    revealed.dispose();
  });

  it('can be enabled at runtime, bounded, subscribed to and cleared', () => {
    const onDiagnostic = vi.fn();
    const runtime = new FormRuntime(schema, values(), { diagnostics: { onDiagnostic } });
    runtime.setValue('email', 'a');
    expect(onDiagnostic).not.toHaveBeenCalled();

    runtime.diagnostics.enable({ limit: 3 });
    const seen: RuntimeDiagnosticEvent[] = [];
    const unsubscribe = runtime.diagnostics.subscribe((event) => seen.push(event));
    for (const email of ['b', 'c', 'd', 'e']) runtime.setValue('email', email);

    expect(runtime.diagnostics.getTrace()).toHaveLength(3);
    expect(seen).toHaveLength(4);
    expect(onDiagnostic).toHaveBeenCalledTimes(4);
    const sequences = runtime.diagnostics.getTrace().map((event) => event.sequence);
    expect(sequences).toEqual([...sequences].sort((a, b) => a - b));

    unsubscribe();
    runtime.diagnostics.disable();
    runtime.setValue('email', 'f');
    expect(seen).toHaveLength(4);
    runtime.diagnostics.clear();
    expect(runtime.diagnostics.getTrace()).toEqual([]);
    runtime.dispose();
  });

  it('isolates failing diagnostic listeners from Core', async () => {
    const failure = new Error('listener failed');
    const unhandled = vi.fn();
    const originalQueue = globalThis.queueMicrotask;
    globalThis.queueMicrotask = (callback) => originalQueue(() => { try { callback(); } catch (error) { unhandled(error); } });
    try {
      const runtime = new FormRuntime(schema, values(), { diagnostics: { enabled: true, onDiagnostic: () => { throw failure; } } });
      expect(() => runtime.setValue('email', 'x')).not.toThrow();
      expect(runtime.store.getValue('email')).toBe('x');
      await flush();
      expect(unhandled).toHaveBeenCalledWith(failure);
      runtime.dispose();
    } finally {
      globalThis.queueMicrotask = originalQueue;
    }
  });
});

describe('data-source request diagnostics', () => {
  it('reports start, success, and stale (discarded) responses', async () => {
    const events: DataSourceRequestEvent[] = [];
    const manager = new DataSourceManager({ onRequest: (event) => events.push(event) });
    const first = deferred<string[]>();
    const second = deferred<string[]>();
    // Loaders that ignore the abort signal, so the superseded request still resolves.
    const firstLoad = manager.loadConfig('cities', { load: () => first.promise }, { values: {} });
    const secondLoad = manager.loadConfig('cities', { load: () => second.promise }, { values: {} });

    second.resolve(['Chennai']);
    await secondLoad;
    first.resolve(['stale']);
    await firstLoad;

    const [firstId, secondId] = events.filter((event) => event.phase === 'start').map((event) => event.requestId);
    expect(secondId).toBeGreaterThan(firstId);
    expect(events.map((event) => [event.requestId, event.phase])).toEqual([[firstId, 'start'], [secondId, 'start'], [secondId, 'success'], [firstId, 'stale']]);
    expect(manager.getState('cities')?.data).toEqual(['Chennai']);
  });

  it('reports cancelled requests and errors', async () => {
    const events: DataSourceRequestEvent[] = [];
    const manager = new DataSourceManager({ onRequest: (event) => events.push(event) });
    const aborting = manager.loadConfig('a', {
      load: ({ signal }) => new Promise<string[]>((_, reject) => signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))),
    }, { values: {} });
    manager.cancel('a');
    await expect(aborting).rejects.toThrow('aborted');
    await expect(manager.loadConfig('b', { load: () => { throw new Error('boom'); } }, { values: {} })).rejects.toThrow('boom');

    expect(events.filter((event) => event.name === 'a').map((event) => event.phase)).toEqual(['start', 'cancelled']);
    expect(events.filter((event) => event.name === 'b').map((event) => [event.phase, event.error?.message])).toEqual([['start', undefined], ['error', 'boom']]);
  });

  it('exposes the active request and the last discarded one on the field explanation', async () => {
    const pending: Array<ReturnType<typeof deferred<string[]>>> = [];
    const runtime = new FormRuntime({
      id: 'datasource-diagnostics',
      fields: [
        { name: 'country', type: 'select' },
        { name: 'city', type: 'select', dependsOn: ['country'], dataSource: { load: () => { const next = deferred<string[]>(); pending.push(next); return next.promise; } } },
      ],
    }, { country: 'IN', city: '' }, { diagnostics: { enabled: true } });

    runtime.setValue('country', 'US');
    await flush();
    const loading = runtime.explainFieldState('city').dataSource;
    expect(loading).toMatchObject({ status: 'loading', loading: true, activeRequestId: loading?.requestId });

    runtime.setValue('country', 'FR');
    await flush();
    pending[1].resolve(['Paris']);
    pending[0].resolve(['New York']);
    await flush();

    const settled = runtime.explainFieldState('city').dataSource;
    expect(settled).toMatchObject({ status: 'success', loading: false });
    expect(settled).not.toHaveProperty('activeRequestId');
    expect(settled?.lastDiscarded).toMatchObject({ type: 'dataSourceRequest', path: 'city' });
    expect(['stale', 'cancelled']).toContain(settled?.lastDiscarded?.phase);
    expect(runtime.dataSources.getState('city')?.data).toEqual(['Paris']);
    runtime.dispose();
  });
});
