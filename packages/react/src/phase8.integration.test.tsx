/** @vitest-environment happy-dom */
import { StrictMode, useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { FormStore, type FormErrors, type FormSchema, type FormValidator } from '@lourthuxavierm/dynamic-forms-core';
import { describe, expect, it, vi } from 'vitest';
import { FormProvider, useField, useFieldState, useFormActions, useWatch, useDataSource } from './index';

const dataLoad = async () => ['one', 'two'];
const dataConfig = { type: 'function' as const, load: dataLoad };

const schema: FormSchema = {
  id: 'phase-8',
  fields: [
    { name: 'name', type: 'text', validation: { required: true } },
    { name: 'other', type: 'text' },
    { name: 'details', type: 'text', visibleWhen: { field: 'name', operator: 'equals', value: 'show' } },
  ],
};

function FieldProbe({ name, renders }: { name: string; renders: Record<string, number> }) {
  const field = useField<string>(name);
  renders[name] = (renders[name] ?? 0) + 1;
  return <button data-testid={name} onClick={() => field.setValue(`${field.value}!`)}>{field.value}</button>;
}

function StateProbe({ name }: { name: string }) {
  const state = useFieldState(name);
  return <output data-testid={`${name}-visible`}>{String(state.visible)}</output>;
}

describe('React adapter integration quality gates', () => {
  it('isolates field subscriptions and exposes stable field actions', () => {
    const store = new FormStore({ name: 'A', other: 'B' });
    const renders: Record<string, number> = {};
    render(<FormProvider store={store} schema={schema}><FieldProbe name="name" renders={renders} /><FieldProbe name="other" renders={renders} /></FormProvider>);
    const otherBefore = renders.other;
    fireEvent.click(screen.getByTestId('name'));
    return waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('A!');
      expect(renders.other).toBe(otherBefore);
    });
  });

  it('updates conditional state and supports nested reset actions', async () => {
    const store = new FormStore({ name: '', profile: { city: 'Delhi' } });
    function Actions() {
      const { setValue, resetField } = useFormActions();
      useEffect(() => { setValue('name', 'show'); setValue('profile.city', 'Mumbai'); resetField('profile.city'); }, [resetField, setValue]);
      return <StateProbe name="details" />;
    }
    render(<FormProvider store={store} schema={schema}><Actions /></FormProvider>);
    await waitFor(() => expect(screen.getByTestId('details-visible').textContent).toBe('true'));
    expect(store.getValue('profile.city')).toBe('Delhi');
  });

  it('validates invalid submissions without invoking submit handlers', async () => {
    const store = new FormStore({ name: '' });
    const onSubmit = vi.fn();
    let validate!: () => Promise<boolean>;
    function Probe() { const field = useField('name'); validate = field.validate; return null; }
    render(<FormProvider store={store} schema={schema} onSubmit={onSubmit}><Probe /></FormProvider>);
    expect(await validate()).toBe(false);
    expect(store.getState().errors.name).toBeDefined();
  });

  it('composes a custom form validator after schema validation', async () => {
    const store = new FormStore({ name: 'Ada' });
    const formValidator: FormValidator<{ name: string }> = vi.fn(async (values): Promise<FormErrors> => (
      values.name === 'Ada' ? { name: 'Name is reserved' } : {}
    ));
    const onSubmit = vi.fn();
    let validateForm!: () => Promise<boolean>;
    let submit!: () => Promise<unknown>;
    function Actions() { ({ validateForm, submit } = useFormActions()); return null; }
    render(<FormProvider store={store} schema={schema} formValidator={formValidator} onSubmit={onSubmit}><Actions /></FormProvider>);
    expect(await validateForm()).toBe(false);
    expect(store.getState().errors.name).toBe('Name is reserved');
    expect(await submit()).toBeUndefined();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('loads data sources and supports value-only watches', async () => {
    function Probe() {
      const value = useWatch<string>('name');
      const source = useDataSource<string>('options', { config: dataConfig });
      return <output data-testid="source">{`${value}:${source.data.join(',')}`}</output>;
    }
    const store = new FormStore({ name: 'watched' });
    render(<FormProvider store={store} schema={schema}><Probe /></FormProvider>);
    await waitFor(() => expect(screen.getByTestId('source').textContent).toBe('watched:one,two'));
  });

  it('is SSR-safe and cleans up subscriptions under Strict Mode', () => {
    const store = new FormStore({ name: 'server' });
    const subscribe = vi.spyOn(store, 'subscribeToField');
    function Probe() { return <output>{useWatch<string>('name')}</output>; }
    expect(() => renderToString(<FormProvider store={store} schema={schema}><Probe /></FormProvider>)).not.toThrow();
    const view = render(<StrictMode><FormProvider store={store} schema={schema}><Probe /></FormProvider></StrictMode>);
    view.unmount();
    expect(subscribe).toHaveBeenCalled();
  });
});
