/** @vitest-environment happy-dom */
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DynamicField,
  FormErrorSummary,
  FormProvider,
  useDataSource,
  useField,
  useFieldState,
  useFormActions,
  useFormEvent,
  useFormState,
  useWatch,
  type FieldComponentProps,
} from './index';

afterEach(() => cleanup());

const FIELD_COUNT = 500;
const largeSchema: FormSchema = {
  id: 'large',
  fields: Array.from({ length: FIELD_COUNT }, (_, index) => ({ name: `f${index}`, type: 'text', validation: { minLength: 2 } })),
};

describe(`render isolation with ${FIELD_COUNT} fields`, () => {
  function Field({ name, renders }: { name: string; renders: Map<string, number> }) {
    const field = useField<string>(name);
    renders.set(name, (renders.get(name) ?? 0) + 1);
    return <span>{field.value}{field.error}</span>;
  }

  function renderLargeForm() {
    const store = new FormStore(Object.fromEntries(largeSchema.fields.map((field) => [field.name, ''])));
    const renders = new Map<string, number>();
    let actions!: ReturnType<typeof useFormActions>;
    function Actions() { actions = useFormActions(); return null; }
    render(
      <FormProvider store={store} schema={largeSchema}>
        {largeSchema.fields.map((field) => <Field key={field.name} name={field.name} renders={renders} />)}
        <Actions />
      </FormProvider>,
    );
    return { store, renders, actions: () => actions };
  }

  const changedSince = (before: Map<string, number>, after: Map<string, number>) =>
    [...after].filter(([name, count]) => count !== before.get(name)).map(([name]) => name);

  it('re-renders only the changed field', async () => {
    const { store, renders } = renderLargeForm();
    await act(async () => { await Promise.resolve(); });
    const before = new Map(renders);

    act(() => store.setValue('f250', 'hello'));

    expect(changedSince(before, renders)).toEqual(['f250']);
  });

  it('re-renders only the validated field during and after field validation', async () => {
    const { renders, actions, store } = renderLargeForm();
    await act(async () => { await Promise.resolve(); });
    act(() => store.setValue('f10', 'x'));
    const before = new Map(renders);

    await act(async () => { await actions().validateField('f10'); });

    expect(changedSince(before, renders)).toEqual(['f10']);
    expect(store.getState().errors.f10).toBeDefined();
  });

  it('batches a form-wide reset into at most one render per field', async () => {
    const { store, renders } = renderLargeForm();
    await act(async () => { await Promise.resolve(); });
    act(() => { for (let index = 0; index < 20; index += 1) store.setValue(`f${index}`, 'v'); });
    const before = new Map(renders);

    act(() => store.reset());

    for (const [name, count] of renders) expect(count - (before.get(name) ?? 0)).toBeLessThanOrEqual(1);
  });
});

const conditionalSchema: FormSchema = {
  id: 'ssr',
  fields: [
    { name: 'kind', type: 'select' },
    { name: 'company', type: 'text', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' } },
    { name: 'note', type: 'text', disabledWhen: { field: 'kind', operator: 'equals', value: 'business' } },
  ],
};

function renderControl({ name, value, disabled }: FieldComponentProps) {
  return <input aria-label={name} name={name} defaultValue={String(value ?? '')} disabled={disabled} />;
}

function ConditionalForm({ store }: { store: FormStore }) {
  return (
    <FormProvider store={store} schema={conditionalSchema}>
      <DynamicField name="kind" render={renderControl} />
      <DynamicField name="company" render={renderControl} />
      <DynamicField name="note" render={renderControl} />
    </FormProvider>
  );
}

describe('server rendering and hydration', () => {
  it('applies Core conditions during server rendering', () => {
    const html = renderToString(<ConditionalForm store={new FormStore({ kind: 'individual', company: 'secret', note: '' })} />);
    expect(html).toContain('aria-label="kind"');
    expect(html).not.toContain('aria-label="company"');
    expect(html).not.toContain('secret');

    const business = renderToString(<ConditionalForm store={new FormStore({ kind: 'business', company: 'Acme', note: '' })} />);
    expect(business).toContain('aria-label="company"');
    expect(business).toMatch(/aria-label="note"[^>]*disabled/);
  });

  it('hydrates without mismatches and then reacts to changes', async () => {
    const serverStore = new FormStore({ kind: 'individual', company: '', note: '' });
    const container = document.createElement('div');
    container.innerHTML = renderToString(<ConditionalForm store={serverStore} />);
    document.body.append(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const clientStore = new FormStore({ kind: 'individual', company: '', note: '' });

    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => { root = hydrateRoot(container, <ConditionalForm store={clientStore} />); });
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector('[aria-label="company"]')).toBeNull();

    act(() => clientStore.setValue('kind', 'business'));
    await waitFor(() => expect(container.querySelector('[aria-label="company"]')).not.toBeNull());
    errors.mockRestore();
    act(() => root.unmount());
    container.remove();
  });

  it('never renders a conditionally hidden field on the first client render', () => {
    const store = new FormStore({ kind: 'individual', company: '', note: '' });
    const seen: boolean[] = [];
    function Probe() { seen.push(useFieldState('company').visible); return null; }
    render(<FormProvider store={store} schema={conditionalSchema}><Probe /></FormProvider>);
    expect(seen.every((visible) => visible === false)).toBe(true);
  });
});

/** Wraps every store subscription API and counts listeners that are still attached. */
function trackSubscriptions(store: FormStore) {
  let active = 0;
  const methods = ['on', 'subscribe', 'subscribeToField', 'subscribeSelector', 'subscribeToValue', 'subscribeToError', 'subscribeToTouched', 'subscribeToDirty'] as const;
  for (const method of methods) {
    const original = (store[method] as (...args: unknown[]) => () => void).bind(store);
    (store as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => {
      const cleanup = original(...args);
      active += 1;
      let done = false;
      return () => { if (!done) { done = true; active -= 1; } cleanup(); };
    };
  }
  return { get active() { return active; } };
}

describe('React Strict Mode', () => {
  it('leaves no store subscriptions or controllers behind after unmount', async () => {
    const schema: FormSchema = {
      id: 'strict',
      fields: [
        { name: 'kind', type: 'select' },
        { name: 'company', type: 'text', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' } },
        { name: 'city', type: 'select', dependsOn: ['kind'], dataSource: { type: 'static', options: ['a'] } },
      ],
    };
    const store = new FormStore({ kind: 'business', company: '', city: '' });
    const tracker = trackSubscriptions(store);
    const onEvent = vi.fn();
    function Everything({ children }: { children?: ReactNode }) {
      useWatch(['kind', 'company']);
      useFormState((state) => state.valid);
      useFormEvent('valueChange', () => undefined);
      useDataSource('city');
      useFieldState('company');
      return <>{children}</>;
    }
    const view = render(
      <StrictMode>
        <FormProvider store={store} schema={schema} onEvent={onEvent}>
          <Everything>
            <FormErrorSummary />
            <DynamicField name="company" render={renderControl} />
          </Everything>
        </FormProvider>
      </StrictMode>,
    );
    await act(async () => { await Promise.resolve(); });
    expect(tracker.active).toBeGreaterThan(0);
    act(() => store.setValue('kind', 'individual'));
    expect(onEvent).toHaveBeenCalled();

    view.unmount();
    expect(tracker.active).toBe(0);

    onEvent.mockClear();
    store.setValue('kind', 'business');
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('does not double-apply effects: one controller instance remains active', async () => {
    const store = new FormStore({ kind: 'individual', company: 'x' });
    const schema: FormSchema = { id: 'strict-policy', fields: [{ name: 'kind', type: 'select' }, { name: 'company', type: 'text', hiddenValuePolicy: 'clear', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' } }] };
    const values = vi.fn();
    store.on('valueChange', (event) => values(event.field));
    render(<StrictMode><FormProvider store={store} schema={schema}><></></FormProvider></StrictMode>);
    await act(async () => { await Promise.resolve(); });
    values.mockClear();

    act(() => store.setValue('kind', 'business'));
    act(() => store.setValue('company', 'Acme'));
    act(() => store.setValue('kind', 'individual'));

    expect(values.mock.calls.filter(([field]) => field === 'company')).toHaveLength(2);
    expect(store.getValue('company')).toBeUndefined();
  });
});
