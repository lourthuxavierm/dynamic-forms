/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HtmlForm } from './index';

afterEach(cleanup);

const simpleSchema: FormSchema = { id: 'submit-behavior', fields: [{ name: 'name', type: 'text', label: 'Name', validation: { required: true } }] };

describe('HTML form behavior', () => {
  it('validates once, blocks a second submit, and exposes submitting state until completion', async () => {
    const store = new FormStore({ name: 'Ada' });
    let finish!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const view = render(<FormProvider schema={simpleSchema} store={store}><HtmlForm onSubmit={onSubmit} /></FormProvider>);
    const form = view.container.querySelector('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(store.getState().submitting).toBe(true);
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect((view.getByRole('button', { name: 'Submit' }) as HTMLButtonElement).disabled).toBe(true);
    finish();
    await waitFor(() => expect(store.getState().submitting).toBe(false));
    expect((view.getByRole('button', { name: 'Submit' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('announces rejected submissions, calls the error handler, and clears the alert on retry', async () => {
    const store = new FormStore({ name: 'Ada' });
    const failure = new Error('Save failed');
    const onSubmit = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(undefined);
    const onSubmitError = vi.fn();
    const view = render(<FormProvider schema={simpleSchema} store={store}><HtmlForm onSubmit={onSubmit} onSubmitError={onSubmitError} /></FormProvider>);
    const form = view.container.querySelector('form')!;
    fireEvent.submit(form);
    await waitFor(() => expect(view.getByRole('alert', { name: '' }).textContent).toBe('Save failed'));
    expect(onSubmitError).toHaveBeenCalledWith(failure);
    expect(store.getState().submitting).toBe(false);
    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(view.queryByText('Save failed')).toBeNull();
  });

  it('submits retained hidden values and applies an explicit clear policy', async () => {
    const schema: FormSchema = { id: 'hidden-values', fields: [
      { name: 'show', type: 'checkbox', label: 'Show details' },
      { name: 'retained', type: 'text', label: 'Retained', visibleWhen: { field: 'show', operator: 'equals', value: true } },
      { name: 'cleared', type: 'text', label: 'Cleared', hiddenValuePolicy: 'clear', visibleWhen: { field: 'show', operator: 'equals', value: true } },
    ] };
    const store = new FormStore({ show: true, retained: 'keep', cleared: 'remove' });
    const onSubmit = vi.fn();
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm onSubmit={onSubmit} /></FormProvider>);
    fireEvent.click(view.getByRole('checkbox', { name: 'Show details' }));
    await waitFor(() => expect(view.queryByLabelText('Retained')).toBeNull());
    fireEvent.submit(view.container.querySelector('form')!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ show: false, retained: 'keep', cleared: undefined });
  });

  it('applies conditional required, disabled, and readonly states', async () => {
    const active = { field: 'active', operator: 'equals' as const, value: true };
    const schema: FormSchema = { id: 'conditional-states', fields: [
      { name: 'active', type: 'checkbox', label: 'Active' },
      { name: 'requiredValue', type: 'text', label: 'Required value', requiredWhen: active },
      { name: 'lockedValue', type: 'text', label: 'Locked value', disabledWhen: active },
      { name: 'readonlyValue', type: 'text', label: 'Readonly value', readOnlyWhen: active },
    ] };
    const store = new FormStore({ active: false, requiredValue: '', lockedValue: 'locked', readonlyValue: 'read' });
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm /></FormProvider>);
    fireEvent.click(view.getByRole('checkbox', { name: 'Active' }));
    await waitFor(() => {
      expect((view.getByLabelText(/^Required value/) as HTMLInputElement).required).toBe(true);
      expect((view.getByLabelText('Locked value') as HTMLInputElement).disabled).toBe(true);
      expect((view.getByLabelText('Readonly value') as HTMLInputElement).readOnly).toBe(true);
    });
  });
});
