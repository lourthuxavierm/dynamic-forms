/** @vitest-environment happy-dom */
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { StrictMode, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider, type FieldComponentProps } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HtmlForm, createDefaultHtmlRegistry } from './index';

afterEach(() => cleanup());

/** Wraps the default text control so renders can be counted per field path. */
function countingText(counts: Map<string, number>): ComponentType<FieldComponentProps> {
  const Base = createDefaultHtmlRegistry().text as ComponentType<FieldComponentProps>;
  return function CountedText(props: FieldComponentProps) {
    counts.set(props.name, (counts.get(props.name) ?? 0) + 1);
    return <Base {...props} />;
  };
}
const changed = (before: Map<string, number>, after: Map<string, number>) => [...after].filter(([name, count]) => count !== before.get(name)).map(([name]) => name);

describe('render isolation', () => {
  it('re-renders only the edited control in a 500-field HtmlForm', () => {
    const fields = Array.from({ length: 500 }, (_, index) => ({ name: `field${index}`, type: 'text', label: `Field ${index}` }));
    const store = new FormStore(Object.fromEntries(fields.map((field) => [field.name, ''])));
    const counts = new Map<string, number>();
    const view = render(<FormProvider store={store} schema={{ id: 'large', fields }}><HtmlForm errorSummary={false} registry={{ text: countingText(counts) }} /></FormProvider>);
    expect(view.container.querySelectorAll('input')).toHaveLength(500);
    const before = new Map(counts);

    fireEvent.change(view.getByLabelText('Field 250'), { target: { value: 'hello' } });

    expect(store.getValue('field250')).toBe('hello');
    expect(changed(before, counts)).toEqual(['field250']);
  }, 30_000);

  it('does not re-render array items when a field outside the array changes', () => {
    const schema: FormSchema = { id: 'array-isolation', fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'rows', type: 'array', label: 'Rows', fields: [{ name: 'value', type: 'text', label: 'Value' }] },
    ] };
    const store = new FormStore({ title: '', rows: [{ value: 'a' }, { value: 'b' }, { value: 'c' }] });
    const counts = new Map<string, number>();
    const view = render(<FormProvider store={store} schema={schema}><HtmlForm errorSummary={false} registry={{ text: countingText(counts) }} /></FormProvider>);
    const before = new Map(counts);

    fireEvent.change(view.getByLabelText('Title'), { target: { value: 'x' } });

    expect(changed(before, counts)).toEqual(['title']);
  });
});

describe('array fields', () => {
  const schema: FormSchema = { id: 'arrays', fields: [
    { name: 'showNotes', type: 'checkbox', label: 'Show notes' },
    { name: 'rows', type: 'array', label: 'Rows', fields: [
      { name: 'value', type: 'text', label: 'Value' },
      { name: 'notes', type: 'text', label: 'Notes', visibleWhen: { field: 'showNotes', operator: 'equals', value: true } },
    ] },
  ] };

  it('shows item-level errors for either path spelling', () => {
    const store = new FormStore({ showNotes: false, rows: [{ value: 'a' }, { value: 'b' }] });
    const view = render(<FormProvider store={store} schema={schema}><HtmlForm errorSummary={false} /></FormProvider>);
    act(() => store.setError('rows[1]', 'Row two is invalid'));
    expect(view.getByText('Row two is invalid').closest('fieldset')?.querySelector('legend')?.textContent).toBe('Rows 2');
    act(() => { store.clearError('rows[1]'); store.setError('rows.0', 'Row one is invalid'); });
    expect(view.queryByText('Row two is invalid')).toBeNull();
    expect(view.getByText('Row one is invalid')).toBeTruthy();
  });

  it('re-evaluates item conditions when a referenced form field changes', async () => {
    const store = new FormStore({ showNotes: false, rows: [{ value: 'a', notes: '' }, { value: 'b', notes: '' }] });
    const view = render(<FormProvider store={store} schema={schema}><HtmlForm errorSummary={false} /></FormProvider>);
    expect(view.queryAllByLabelText('Notes')).toHaveLength(0);

    act(() => store.setValue('showNotes', true));
    await waitFor(() => expect(view.getAllByLabelText('Notes')).toHaveLength(2));
  });
});

describe('HtmlForm submission', () => {
  const schema: FormSchema = { id: 'submit', fields: [
    { name: 'name', type: 'text', label: 'Name', validation: { required: true } },
    { name: 'tags', type: 'array', label: 'Tags', fields: [{ name: 'label', type: 'text', label: 'Label' }] },
  ] };
  const values = () => ({ name: 'Ada', tags: [{ label: 'x' }] });
  const submitButton = (view: ReturnType<typeof render>) => view.getByRole('button', { name: 'Submit' });

  it('does not submit while the provider is disabled', async () => {
    const onSubmit = vi.fn();
    const view = render(<FormProvider store={new FormStore(values())} schema={schema} disabled><HtmlForm onSubmit={onSubmit} /></FormProvider>);
    await act(async () => { fireEvent.click(submitButton(view)); });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits once, disables controls while pending, and emits a submit event', async () => {
    const store = new FormStore(values());
    let finish!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const events: string[] = [];
    const view = render(<FormProvider store={store} schema={schema} onEvent={(event) => events.push(event.type)}><HtmlForm onSubmit={onSubmit} /></FormProvider>);

    await act(async () => { fireEvent.click(submitButton(view)); fireEvent.click(submitButton(view)); });
    await waitFor(() => expect(store.getState().submitting).toBe(true));
    fireEvent.click(submitButton(view));
    expect((view.getByLabelText(/Name/) as HTMLInputElement).disabled).toBe(true);
    expect((view.getByRole('group', { name: 'Tags' }) as HTMLFieldSetElement).disabled).toBe(true);

    await act(async () => { finish(); await Promise.resolve(); });
    await waitFor(() => expect(store.getState().submitting).toBe(false));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(values());
    expect(events).toContain('submit');
    expect((view.getByLabelText(/Name/) as HTMLInputElement).disabled).toBe(false);
  });

  it('delegates to the provider onSubmit when HtmlForm has none', async () => {
    const onSubmit = vi.fn();
    const view = render(<FormProvider store={new FormStore(values())} schema={schema} onSubmit={onSubmit}><HtmlForm /></FormProvider>);
    await act(async () => { fireEvent.click(submitButton(view)); });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(values()));
  });

  it('routes handler errors to onError instead of an unhandled rejection', async () => {
    const onError = vi.fn();
    const failure = new Error('server down');
    const view = render(<FormProvider store={new FormStore(values())} schema={schema}><HtmlForm onSubmit={() => { throw failure; }} onError={onError} /></FormProvider>);
    await act(async () => { fireEvent.click(submitButton(view)); });
    await waitFor(() => expect(onError).toHaveBeenCalledWith(failure));
  });

  it('still validates and focuses the first invalid control', async () => {
    const onSubmit = vi.fn();
    const view = render(<FormProvider store={new FormStore({ name: '', tags: [] })} schema={schema}><HtmlForm onSubmit={onSubmit} /></FormProvider>);
    await act(async () => { fireEvent.click(submitButton(view)); });
    await waitFor(() => expect(document.activeElement).toBe(view.getByLabelText(/Name/)));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('form-level read-only and disabled', () => {
  const schema: FormSchema = { id: 'locks', fields: [
    { name: 'name', type: 'text', label: 'Name' },
    { name: 'address', type: 'object', label: 'Address', fields: [{ name: 'city', type: 'text', label: 'City' }] },
    { name: 'tags', type: 'array', label: 'Tags', fields: [{ name: 'label', type: 'text', label: 'Label' }] },
  ] };
  const values = { name: 'Ada', address: { city: 'Pune' }, tags: [{ label: 'x' }] };

  it('applies readOnly to controls and blocks array mutations', () => {
    const view = render(<FormProvider store={new FormStore(values)} schema={schema} readOnly><HtmlForm /></FormProvider>);
    expect((view.getByLabelText('Name') as HTMLInputElement).readOnly).toBe(true);
    expect((view.getByLabelText('City') as HTMLInputElement).readOnly).toBe(true);
    expect((view.getByRole('button', { name: 'Add item' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables object and array fieldsets when the form is disabled', () => {
    const view = render(<FormProvider store={new FormStore(values)} schema={schema} disabled><HtmlForm /></FormProvider>);
    expect((view.getByLabelText('Name') as HTMLInputElement).disabled).toBe(true);
    expect((view.getByRole('group', { name: 'Address' }) as HTMLFieldSetElement).disabled).toBe(true);
    expect((view.getByRole('group', { name: 'Tags' }) as HTMLFieldSetElement).disabled).toBe(true);
  });
});

describe('server rendering and Strict Mode', () => {
  const schema: FormSchema = { id: 'ssr', fields: [
    { name: 'kind', type: 'select', label: 'Kind', options: [{ label: 'Person', value: 'person' }, { label: 'Company', value: 'company' }] },
    { name: 'company', type: 'text', label: 'Company name', visibleWhen: { field: 'kind', operator: 'equals', value: 'company' } },
    { name: 'tags', type: 'array', label: 'Tags', fields: [{ name: 'label', type: 'text', label: 'Label' }] },
  ] };

  it('omits conditionally hidden fields and their values from server HTML', () => {
    const html = renderToString(<FormProvider store={new FormStore({ kind: 'person', company: 'Secret Ltd', tags: [] })} schema={schema}><HtmlForm /></FormProvider>);
    expect(html).toContain('Kind');
    expect(html).not.toContain('Company name');
    expect(html).not.toContain('Secret Ltd');
  });

  it('releases every store subscription after unmount under Strict Mode', () => {
    const store = new FormStore({ kind: 'company', company: '', tags: [{ label: 'a' }] });
    let active = 0;
    for (const method of ['on', 'subscribe', 'subscribeToField', 'subscribeSelector'] as const) {
      const original = (store[method] as (...args: unknown[]) => () => void).bind(store);
      (store as unknown as Record<string, unknown>)[method] = (...args: unknown[]) => {
        const off = original(...args);
        active += 1;
        let done = false;
        return () => { if (!done) { done = true; active -= 1; } off(); };
      };
    }
    const view = render(<StrictMode><FormProvider store={store} schema={schema}><HtmlForm /></FormProvider></StrictMode>);
    act(() => store.setValue('kind', 'person'));
    expect(active).toBeGreaterThan(0);
    view.unmount();
    expect(active).toBe(0);
  });
});
