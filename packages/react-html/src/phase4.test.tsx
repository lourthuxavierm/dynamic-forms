/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { FormStore, type FieldSchema, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HtmlForm, createDefaultHtmlRegistry } from './index';

afterEach(cleanup);

const inventory = [
  'text', 'textarea', 'password', 'email', 'url', 'number', 'integer', 'decimal',
  'hidden', 'checkbox', 'radio', 'select', 'multi-select', 'date', 'time',
  'datetime', 'month', 'file',
] as const;

function schema(fields: readonly FieldSchema[]): FormSchema {
  return { id: 'baseline', fields };
}

describe('Phase 4 baseline native controls', () => {
  it('registers the complete baseline inventory', () => {
    const registry = createDefaultHtmlRegistry();
    for (const type of inventory) expect(registry[type]).toBeDefined();
  });

  it('renders every baseline type with stable names and native input semantics', () => {
    const fields = inventory.map((type) => ({
      name: type,
      type,
      label: type,
      options: type === 'radio' || type === 'select' || type === 'multi-select'
        ? [{ label: 'One', value: 1 }]
        : undefined,
    }));
    const store = new FormStore(Object.fromEntries(inventory.map((type) => [type, type === 'checkbox' ? false : type === 'multi-select' ? [] : ''])));
    const view = render(<FormProvider store={store} schema={schema(fields)}><HtmlForm /></FormProvider>);
    for (const type of inventory) {
      expect(view.container.querySelector('[name="' + type + '"]')).toBeTruthy();
    }
    expect(view.container.querySelector('[name=datetime]')?.getAttribute('type')).toBe('datetime-local');
    expect(view.container.querySelector('[name=integer]')?.getAttribute('step')).toBe('1');
  });

  it('normalizes native changes while preserving typed option values', () => {
    const fields: FieldSchema[] = [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'age', type: 'integer', label: 'Age' },
      { name: 'active', type: 'checkbox', label: 'Active' },
      { name: 'level', type: 'select', label: 'Level', options: [{ label: 'Senior', value: 7 }] },
      { name: 'roles', type: 'multi-select', label: 'Roles', options: [{ label: 'Admin', value: 'admin' }, { label: 'Audit', value: 'audit' }] },
    ];
    const store = new FormStore({ name: '', age: 0, active: false, level: undefined, roles: [] });
    const view = render(<FormProvider store={store} schema={schema(fields)}><HtmlForm /></FormProvider>);
    fireEvent.change(view.container.querySelector('[name=name]')!, { target: { value: 'Ada' } });
    fireEvent.change(view.container.querySelector('[name=age]')!, { target: { value: '42' } });
    fireEvent.click(view.container.querySelector('[name=active]')!);
    fireEvent.change(view.container.querySelector('[name=level]')!, { target: { value: '0' } });
    const roles = view.container.querySelector('[name=roles]') as HTMLSelectElement;
    roles.options[0].selected = true;
    roles.options[1].selected = true;
    fireEvent.change(roles);
    expect(store.getValues()).toMatchObject({ name: 'Ada', age: 42, active: true, level: 7, roles: ['admin', 'audit'] });
  });

  it('exposes descriptions, errors, required state, and touched/dirty state', async () => {
    const field: FieldSchema = { name: 'email', type: 'email', label: 'Email', description: 'Work address', validation: { required: true } };
    const store = new FormStore({ email: '' });
    store.setError('email', 'Email is required');
    const view = render(<FormProvider store={store} schema={schema([field])}><HtmlForm /></FormProvider>);
    const input = view.container.querySelector('[name=email]') as HTMLInputElement;
    await waitFor(() => expect(input.required).toBe(true));
    expect(input.getAttribute('aria-describedby')).toContain('description');
    expect(input.getAttribute('aria-describedby')).toContain('error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    fireEvent.change(input, { target: { value: 'team@example.com' } });
    fireEvent.blur(input);
    await waitFor(() => {
      const shell = view.container.querySelector('[data-dynamic-forms-control]');
      expect(shell?.getAttribute('data-dirty')).toBe('true');
      expect(shell?.getAttribute('data-touched')).toBe('true');
    });
  });

  it('blocks read-only edits while keeping the control focusable', async () => {
    const field: FieldSchema = { name: 'code', type: 'text', label: 'Code', readOnly: true };
    const store = new FormStore({ code: 'A' });
    const view = render(<FormProvider store={store} schema={schema([field])}><HtmlForm /></FormProvider>);
    const input = view.container.querySelector('[name=code]') as HTMLInputElement;
    await waitFor(() => expect(input.readOnly).toBe(true));
    expect(input.disabled).toBe(false);
    fireEvent.change(input, { target: { value: 'B' } });
    expect(store.getValue('code')).toBe('A');
  });

  it('stores a selected File without controlling the browser file input', () => {
    const field: FieldSchema = { name: 'document', type: 'file', label: 'Document', config: { accept: '.pdf' } };
    const store = new FormStore({ document: null });
    const view = render(<FormProvider store={store} schema={schema([field])}><HtmlForm /></FormProvider>);
    const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' });
    fireEvent.change(view.container.querySelector('[name=document]')!, { target: { files: [file] } });
    expect(store.getValue('document')).toBe(file);
  });

  it('supports change, blur, and submit validation modes with invalid focus', async () => {
    const field: FieldSchema = { name: 'name', type: 'text', label: 'Name', validation: { required: true } };
    for (const mode of ['onChange', 'onBlur'] as const) {
      const store = new FormStore({ name: 'valid' });
      const view = render(<FormProvider store={store} schema={schema([field])} validationMode={mode}><HtmlForm /></FormProvider>);
      const input = view.container.querySelector('[name=name]')!;
      fireEvent.change(input, { target: { value: '' } });
      if (mode === 'onBlur') fireEvent.blur(input);
      await waitFor(() => expect(store.getState().errors.name).toBeDefined());
      view.unmount();
    }

    const submitStore = new FormStore({ name: '' });
    const onSubmit = vi.fn();
    const view = render(<FormProvider store={submitStore} schema={schema([field])}><HtmlForm onSubmit={onSubmit} /></FormProvider>);
    const input = view.container.querySelector('[name=name]') as HTMLInputElement;
    fireEvent.click(view.container.querySelector('button[type=submit]')!);
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
