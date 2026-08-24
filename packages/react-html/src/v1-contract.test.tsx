/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EXPERIMENTAL_HTML_FIELD_TYPES, HtmlForm, V1_HTML_FIELD_TYPES, createDefaultHtmlRegistry } from './index';

afterEach(cleanup);

describe('Native HTML v1 contract', () => {
  it('locks exactly 42 stable controls without counting extensions', () => {
    expect(V1_HTML_FIELD_TYPES).toHaveLength(42);
    expect(new Set(V1_HTML_FIELD_TYPES).size).toBe(42);
    const registry = createDefaultHtmlRegistry();
    for (const type of V1_HTML_FIELD_TYPES) expect(registry[type], type).toBeDefined();
    for (const type of EXPERIMENTAL_HTML_FIELD_TYPES) {
      expect(V1_HTML_FIELD_TYPES).not.toContain(type as never);
      expect(registry[type], type).toBeDefined();
    }
  });

  it('stores year as a number and applies native constraints', () => {
    const schema: FormSchema = {
      id: 'year-control',
      fields: [{ name: 'year', type: 'year', label: 'Year', config: { min: 1900, max: 2100, step: 1 } }],
    };
    const store = new FormStore({ year: 2025 });
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm /></FormProvider>);
    const input = view.getByLabelText('Year') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.min).toBe('1900');
    expect(input.max).toBe('2100');
    expect(input.step).toBe('1');
    fireEvent.change(input, { target: { value: '2030' } });
    expect(store.getValue('year')).toBe(2030);
  });

  it('exposes stable shell styling and state hooks', () => {
    const schema: FormSchema = {
      id: 'shell-contract',
      fields: [{ name: 'code', type: 'text', label: 'Code', description: 'Public identifier', readOnly: true, validation: { required: true } }],
    };
    const store = new FormStore({ code: '' });
    store.setError('code', 'Required');
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm /></FormProvider>);
    const shell = view.container.querySelector('.df-field');
    expect(shell?.classList.contains('df-field-invalid')).toBe(true);
    expect(shell?.classList.contains('df-field-readonly')).toBe(true);
    expect(shell?.querySelector('.df-field-control')).toBeTruthy();
  });
});
