/** @vitest-environment happy-dom */
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { createElement, useState, type ComponentType, type ReactNode } from 'react';
import { FieldRegistry, FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DynamicField,
  FormProvider,
  registerReactField,
  shallowEqual,
  useDataSource,
  useField,
  useFieldArray,
  useForm,
  useFormEvent,
  useFormState,
  useFormStore,
  useWatch,
  type FieldComponentProps,
} from '../index';

afterEach(() => cleanup());

const schema: FormSchema = {
  id: 'hooks',
  fields: [
    { name: 'kind', type: 'select' },
    { name: 'company', type: 'text', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' }, requiredWhen: { field: 'kind', operator: 'equals', value: 'business' } },
    { name: 'profile', type: 'object', fields: [{ name: 'city', type: 'text' }] },
    { name: 'tags', type: 'array', fields: [{ name: 'label', type: 'text' }] },
  ],
};

const wrap = (store: FormStore, extra: Record<string, unknown> = {}) =>
  ({ children }: { children: ReactNode }) => createElement(FormProvider, { store, schema, children, ...extra });

describe('useField', () => {
  it('includes Core condition state and updates it when a referenced field changes', async () => {
    const store = new FormStore({ kind: 'individual', company: '' });
    const { result } = renderHook(() => useField<string>('company'), { wrapper: wrap(store) });
    expect(result.current).toMatchObject({ visible: false, required: false, disabled: false, readOnly: false });

    act(() => store.setValue('kind', 'business'));
    await waitFor(() => expect(result.current).toMatchObject({ visible: true, required: true }));
  });

  it('reads field state for either array spelling', () => {
    const store = new FormStore({ tags: [{ label: 'a' }] });
    const { result } = renderHook(() => useField('tags.0.label'), { wrapper: wrap(store) });
    act(() => { store.setValue('tags[0].label', 'b', { shouldTouch: true }); store.setError('tags[0].label', 'Too short'); });
    expect(result.current).toMatchObject({ value: 'b', error: 'Too short', touched: true, dirty: true });
  });

  it('returns a stable object while nothing about the field changes', () => {
    const store = new FormStore({ kind: '', profile: { city: '' } });
    const { result } = renderHook(() => useField('profile.city'), { wrapper: wrap(store) });
    const first = result.current;
    act(() => store.setValue('kind', 'x'));
    expect(result.current).toBe(first);
  });
});

describe('useFormState', () => {
  it('supports object-returning selectors with shallowEqual without re-render loops', () => {
    const store = new FormStore({ kind: '' });
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useFormState((state) => ({ valid: state.valid, submitting: state.submitting }), shallowEqual);
    }, { wrapper: wrap(store) });
    const first = result.current;
    const settled = renders;

    act(() => store.setValue('kind', 'a'));
    expect(result.current).toBe(first);
    expect(renders).toBe(settled);

    act(() => store.setError('kind', 'bad'));
    expect(result.current).toEqual({ valid: false, submitting: false });
    expect(renders).toBe(settled + 1);
  });

  it('re-renders only when a primitive selection changes', () => {
    const store = new FormStore({ kind: '' });
    let renders = 0;
    renderHook(() => { renders += 1; return useFormState((state) => state.disabled); }, { wrapper: wrap(store) });
    const settled = renders;
    act(() => { store.setValue('kind', 'a'); store.setTouched('kind'); });
    expect(renders).toBe(settled);
    act(() => store.setDisabled(true));
    expect(renders).toBe(settled + 1);
  });

  it('shallowEqual compares one level deep', () => {
    expect(shallowEqual({ a: 1, b: [1] }, { a: 1, b: [1] })).toBe(false);
    const list = [1];
    expect(shallowEqual({ a: 1, b: list }, { a: 1, b: list })).toBe(true);
    expect(shallowEqual([1, 2], [1, 2])).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(shallowEqual(null, null)).toBe(true);
  });
});

describe('useFormEvent', () => {
  it('subscribes once for inline listeners and always calls the latest one', () => {
    const store = new FormStore({ kind: '' });
    const on = vi.spyOn(store, 'on');
    const calls: string[] = [];
    function Probe({ label }: { label: string }) {
      useFormEvent('valueChange', (event) => calls.push(`${label}:${event.field}`));
      return null;
    }
    const view = render(<FormProvider store={store}><Probe label="first" /></FormProvider>);
    const subscriptionsAfterMount = on.mock.calls.filter(([type]) => type === 'valueChange').length;
    view.rerender(<FormProvider store={store}><Probe label="second" /></FormProvider>);

    act(() => store.setValue('kind', 'a'));
    expect(on.mock.calls.filter(([type]) => type === 'valueChange').length).toBe(subscriptionsAfterMount);
    expect(calls).toEqual(['second:kind']);
  });
});

describe('useWatch, useForm, and useFormStore', () => {
  it('watches several paths and re-renders only for them', () => {
    const store = new FormStore({ kind: 'a', profile: { city: 'x' }, other: 1 });
    let renders = 0;
    const { result } = renderHook(() => { renders += 1; return useWatch<unknown>(['kind', 'profile.city']); }, { wrapper: wrap(store) });
    expect(result.current).toEqual(['a', 'x']);
    const settled = renders;
    act(() => store.setValue('other', 2));
    expect(renders).toBe(settled);
    act(() => store.setValue('profile', { city: 'y' }));
    expect(result.current).toEqual(['a', 'y']);
  });

  it('useForm keeps one typed store and registry across renders', () => {
    const { result, rerender } = renderHook(() => useForm<{ name: string }>({ defaultValues: { name: 'Ada' } }));
    const first = result.current;
    rerender();
    expect(result.current.store).toBe(first.store);
    expect(result.current.registry).toBe(first.registry);
    expect(result.current.store.getValue('name')).toBe('Ada');
  });

  it('useFormStore follows an explicit store without a provider', () => {
    const store = new FormStore({ name: 'a' });
    const { result } = renderHook(() => useFormStore(store));
    act(() => store.setValue('name', 'b'));
    expect(result.current.values).toEqual({ name: 'b' });
  });
});

describe('useFieldArray', () => {
  it('appends, removes, and replaces items immutably', () => {
    const store = new FormStore({ tags: [{ label: 'a' }] });
    const { result } = renderHook(() => useFieldArray<{ label: string }>('tags'), { wrapper: wrap(store) });
    act(() => result.current.append({ label: 'b' }));
    act(() => result.current.remove(0));
    expect(store.getValue('tags')).toEqual([{ label: 'b' }]);
    act(() => result.current.replace([{ label: 'c' }, { label: 'd' }]));
    expect(result.current.fields.map((item) => item.value.label)).toEqual(['c', 'd']);
  });
});

describe('useDataSource', () => {
  it('does not refetch in a loop when the config is an inline object', async () => {
    const store = new FormStore({ kind: '' });
    const load = vi.fn(async () => ['one']);
    function Probe() {
      const [, setTick] = useState(0);
      const source = useDataSource<string>('kind', { config: { type: 'function', load: () => load() } });
      return <button type="button" onClick={() => setTick((tick) => tick + 1)}>{source.data.join(',')}</button>;
    }
    render(<FormProvider store={store} schema={schema}><Probe /></FormProvider>);
    await waitFor(() => expect(screen.getByRole('button').textContent).toBe('one'));
    act(() => screen.getByRole('button').click());
    act(() => screen.getByRole('button').click());
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
    expect(load).toHaveBeenCalledOnce();
  });

  it('refetches when a dependency changes and aborts pending work on unmount', async () => {
    const dependentSchema: FormSchema = { id: 'ds', fields: [{ name: 'country', type: 'select' }, { name: 'city', type: 'select', dependsOn: ['country'] }] };
    const store = new FormStore({ country: 'IN', city: '' });
    const signals: AbortSignal[] = [];
    const load = vi.fn(({ signal }: { signal?: AbortSignal }) => { if (signal) signals.push(signal); return new Promise<string[]>(() => undefined); });
    function Probe() { useDataSource('city', { config: { type: 'function', load } }); return null; }
    const view = render(<FormProvider store={store} schema={dependentSchema}><Probe /></FormProvider>);
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));

    act(() => store.setValue('country', 'US'));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(signals[0].aborted).toBe(true);

    view.unmount();
    expect(signals[1].aborted).toBe(true);
  });
});

describe('registerReactField', () => {
  it('registers a typed control that DynamicField renders with Core state', async () => {
    function TextControl({ name, value, setValue, required, visible }: FieldComponentProps<string>) {
      return <input aria-label={name} data-required={String(required)} data-visible={String(visible)} value={value ?? ''} onChange={(event) => setValue(event.target.value)} />;
    }
    const registry = new FieldRegistry<ComponentType<FieldComponentProps<string>>>();
    registerReactField(registry, { type: 'text', component: TextControl });
    const store = new FormStore({ kind: 'business', company: 'Acme' });
    render(<FormProvider store={store} schema={schema} registry={registry as FieldRegistry}><DynamicField name="company" /></FormProvider>);

    const input = screen.getByLabelText('company');
    expect(input.getAttribute('data-required')).toBe('true');
    expect((input as HTMLInputElement).value).toBe('Acme');
  });
});
