/** @vitest-environment happy-dom */
import axe from 'axe-core';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FieldSchema, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HtmlForm } from './index';

afterEach(cleanup);

const choices = [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }];
const groups: Readonly<Record<string, readonly FieldSchema[]>> = {
  numeric: [
    { name: 'number', type: 'number', label: 'Number', description: 'Enter a value' },
    { name: 'currency', type: 'currency', label: 'Currency' },
    { name: 'slider', type: 'slider', label: 'Slider' },
    { name: 'range', type: 'range-slider', label: 'Range' },
    { name: 'rating', type: 'rating', label: 'Rating' },
  ],
  temporal: [
    { name: 'date', type: 'date', label: 'Date' },
    { name: 'dateRange', type: 'date-range', label: 'Date range' },
    { name: 'month', type: 'month', label: 'Month' },
    { name: 'year', type: 'year', label: 'Year' },
  ],
  choices: [
    { name: 'select', type: 'select', label: 'Select', options: choices },
    { name: 'multi', type: 'multi-select', label: 'Multi-select', options: choices },
    { name: 'radio', type: 'radio-group', label: 'Radio group', options: choices },
    { name: 'tree', type: 'tree-select', label: 'Tree', options: choices },
    { name: 'toggles', type: 'toggle-button-group', label: 'Toggles', options: choices },
  ],
  formatted: [
    { name: 'phone', type: 'phone', label: 'Phone' },
    { name: 'otp', type: 'otp', label: 'One-time code' },
    { name: 'pin', type: 'pin', label: 'PIN' },
    { name: 'mask', type: 'mask', label: 'Masked code', config: { mask: '00-00' } },
  ],
  media: [
    { name: 'file', type: 'file', label: 'File' },
    { name: 'files', type: 'multi-file', label: 'Files' },
    { name: 'camera', type: 'camera', label: 'Camera' },
    { name: 'signature', type: 'signature', label: 'Signature' },
    { name: 'preview', type: 'document-preview', label: 'Document preview' },
  ],
  structural: [
    { name: 'profile', type: 'object', label: 'Profile', fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'rows', type: 'array', label: 'Rows', fields: [{ name: 'value', type: 'text', label: 'Value' }] },
    ] },
  ],
};

describe('HTML accessibility contract matrix', () => {
  it.each(Object.entries(groups))('%s passes automated axe checks', async (group, fields) => {
    const schema: FormSchema = { id: 'accessibility-' + group, fields };
    const store = new FormStore(group === 'structural' ? { profile: { name: 'Ada', rows: [{ value: 'first' }] } } : {});
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm errorSummary={false} /></FormProvider>);
    const result = await axe.run(view.container, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations.map(({ id }) => id)).toEqual([]);
  });

  it.each([
    ['currency', 'input'],
    ['slider', 'input'],
    ['range-slider', '[role="group"]'],
    ['rating', '[role="radiogroup"]'],
    ['phone', 'input'],
    ['otp', 'fieldset'],
    ['file', 'input'],
  ] as const)('%s links its description and error to the interactive control or group', (type, selector) => {
    const field: FieldSchema = { name: 'value', type, label: 'Value', description: 'Helpful detail' };
    const schema: FormSchema = { id: 'aria-links', fields: [field] };
    const store = new FormStore({ value: undefined });
    store.setError('value', 'Invalid value');
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm errorSummary={false} /></FormProvider>);
    const target = view.container.querySelector(`[data-field-name="value"] ${selector}`)!;
    const description = view.getByText('Helpful detail');
    const error = view.getByText('Invalid value');
    const references = target.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(references).toContain(description.id);
    expect(references).toContain(error.id);
    expect(target.getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps segmented code inputs keyboard-reachable with directional focus movement', () => {
    const schema: FormSchema = { id: 'keyboard-code', fields: [{ name: 'code', type: 'otp', label: 'Code', config: { length: 3 } }] };
    const view = render(<FormProvider schema={schema} store={new FormStore({ code: '' })}><HtmlForm /></FormProvider>);
    const first = view.getByLabelText('Code digit 1');
    const second = view.getByLabelText('Code digit 2');
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(first);
  });

  it('announces an array item count without making the entire row list a live region', () => {
    const schema: FormSchema = { id: 'array-announcement', fields: [{ name: 'rows', type: 'array', label: 'Rows', fields: [{ name: 'value', type: 'text', label: 'Value' }] }] };
    const view = render(<FormProvider schema={schema} store={new FormStore({ rows: [{ value: 'one' }] })}><HtmlForm /></FormProvider>);
    const count = view.getByText('1 items');
    expect(count.getAttribute('aria-live')).toBe('polite');
    expect(view.container.querySelector('[data-df-field="rows"] > div')?.hasAttribute('aria-live')).toBe(false);
    fireEvent.click(view.getByRole('button', { name: 'Add item' }));
    expect(view.getByText('2 items').getAttribute('aria-live')).toBe('polite');
  });
});
