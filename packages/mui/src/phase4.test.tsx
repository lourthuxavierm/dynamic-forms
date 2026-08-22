// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormStore, type DataSourceContext, type FieldSchema, type FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { MuiAsyncAutocomplete, MuiFieldRenderer, MuiSelect, normalizeFieldOptions, type MuiFieldRegistry } from './index';

afterEach(cleanup);

function RuntimeProbe({ name, disabled, readOnly, required, renders }: { name: string; disabled?: boolean; readOnly?: boolean; required?: boolean; renders?: Record<string, number> }) {
  if (renders) renders[name] = (renders[name] ?? 0) + 1;
  return <input aria-label={name} disabled={disabled} readOnly={readOnly} required={required} />;
}

describe('@dynamic-forms/mui Phase 4 runtime conditions', () => {
  it('maps visible, disabled, required, and read-only runtime results', async () => {
    const schema: FormSchema = {
      id: 'runtime',
      fields: [
        { name: 'enabled', type: 'checkbox' },
        { name: 'secret', type: 'probe', visibleWhen: { field: 'enabled', operator: 'equals', value: true } },
        { name: 'locked', type: 'probe', disabledWhen: { field: 'enabled', operator: 'equals', value: true }, requiredWhen: { field: 'enabled', operator: 'equals', value: true }, readOnlyWhen: { field: 'enabled', operator: 'equals', value: true } },
      ],
    };
    const store = new FormStore({ enabled: false });
    const registry: MuiFieldRegistry = { probe: RuntimeProbe };
    render(<FormProvider store={store} schema={schema}><MuiFieldRenderer field={schema.fields[1]} registry={registry} /><MuiFieldRenderer field={schema.fields[2]} registry={registry} /></FormProvider>);

    await waitFor(() => expect(screen.queryByLabelText('secret')).toBeNull());
    store.setValue('enabled', true);
    await waitFor(() => expect(screen.getByLabelText('secret')).toBeTruthy());
    const locked = screen.getByLabelText('locked') as HTMLInputElement;
    expect(locked.disabled).toBe(true);
    expect(locked.readOnly).toBe(true);
    expect(locked.required).toBe(true);
  });

  it('does not rerender a field affected by a different condition dependency', async () => {
    const schema: FormSchema = {
      id: 'isolation',
      fields: [
        { name: 'leftToggle', type: 'checkbox' },
        { name: 'rightToggle', type: 'checkbox' },
        { name: 'left', type: 'probe', visibleWhen: { field: 'leftToggle', operator: 'equals', value: true } },
        { name: 'right', type: 'probe', visibleWhen: { field: 'rightToggle', operator: 'equals', value: true } },
      ],
    };
    const store = new FormStore({ leftToggle: true, rightToggle: true });
    const renders: Record<string, number> = {};
    const Probe = (props: { name: string }) => <RuntimeProbe {...props} renders={renders} />;
    const registry: MuiFieldRegistry = { probe: Probe };
    render(<FormProvider store={store} schema={schema}><MuiFieldRenderer field={schema.fields[2]} registry={registry} /><MuiFieldRenderer field={schema.fields[3]} registry={registry} /></FormProvider>);
    await waitFor(() => expect(screen.getByLabelText('right')).toBeTruthy());
    const rightBefore = renders.right;

    store.setValue('leftToggle', false);
    await waitFor(() => expect(screen.queryByLabelText('left')).toBeNull());
    expect(renders.right).toBe(rightBefore);
  });
});

describe('@dynamic-forms/mui Phase 4 data sources', () => {
  it('normalizes primitive and grouped object options', () => {
    expect(normalizeFieldOptions(['One', { label: 'Two', value: 2, disabled: true, group: 'Numbers' }])).toEqual([
      { label: 'One', value: 'One' },
      expect.objectContaining({ label: 'Two', value: 2, disabled: true, group: 'Numbers' }),
    ]);
  });

  it('refreshes cascading options with current dependency values', async () => {
    const load = vi.fn(async (context: DataSourceContext) => context.values.country === 'IN'
      ? [{ label: 'Delhi', value: 'DEL' }]
      : [{ label: 'New York', value: 'NYC' }]);
    const city: FieldSchema = { name: 'city', type: 'async-autocomplete', dependsOn: ['country'], dataSource: { type: 'function', load } };
    const schema: FormSchema = { id: 'cascade', fields: [{ name: 'country', type: 'text' }, city] };
    const store = new FormStore({ country: 'IN', city: undefined });
    render(<FormProvider store={store} schema={schema}><MuiFieldRenderer field={city} registry={{ 'async-autocomplete': MuiAsyncAutocomplete }} /></FormProvider>);

    await waitFor(() => expect(load).toHaveBeenCalledWith(expect.objectContaining({ values: expect.objectContaining({ country: 'IN' }) })));
    store.setValue('country', 'US');
    await waitFor(() => expect(load).toHaveBeenCalledWith(expect.objectContaining({ values: expect.objectContaining({ country: 'US' }) })));
  });

  it('cancels a request when a dependent field becomes inactive', async () => {
    let requestSignal: AbortSignal | undefined;
    const city: FieldSchema = {
      name: 'city', type: 'async-autocomplete', dependsOn: ['country'], visibleWhen: { field: 'active', operator: 'equals', value: true },
      dataSource: { type: 'function', load: (context) => { requestSignal = context.signal; return new Promise(() => undefined); } },
    };
    const schema: FormSchema = { id: 'cancel', fields: [{ name: 'active', type: 'checkbox' }, { name: 'country', type: 'text' }, city] };
    const store = new FormStore({ active: true, country: 'IN' });
    render(<FormProvider store={store} schema={schema}><MuiFieldRenderer field={city} registry={{ 'async-autocomplete': MuiAsyncAutocomplete }} /></FormProvider>);
    await waitFor(() => expect(requestSignal).toBeDefined());

    store.setValue('active', false);
    await waitFor(() => expect(requestSignal?.aborted).toBe(true));
  });

  it('shows retryable errors and recovers without losing the current value', async () => {
    let attempt = 0;
    const load = vi.fn(async () => {
      if (++attempt === 1) throw new Error('Service unavailable');
      return [{ label: 'Recovered', value: 'ok' }];
    });
    const field: FieldSchema = { name: 'choice', type: 'async-autocomplete', dataSource: { type: 'function', load } };
    const schema: FormSchema = { id: 'retry', fields: [field] };
    const store = new FormStore({ choice: 'existing' });
    render(<FormProvider store={store} schema={schema}><MuiFieldRenderer field={field} registry={{ 'async-autocomplete': MuiAsyncAutocomplete }} /></FormProvider>);

    await waitFor(() => expect(screen.getByText('Service unavailable')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(store.getValue('choice')).toBe('existing');
  });

  it('renders an explicit empty state for async selects', async () => {
    const field: FieldSchema = { name: 'choice', type: 'select', dataSource: { type: 'static', options: [] } };
    const schema: FormSchema = { id: 'empty', fields: [field] };
    render(<FormProvider schema={schema}><MuiFieldRenderer field={field} registry={{ select: MuiSelect }} /></FormProvider>);
    await waitFor(() => expect(screen.getByText('No options available.')).toBeTruthy());
  });
});
