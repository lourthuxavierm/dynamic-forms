/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { FormStore, type FieldSchema, type FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormProvider } from '@lourthuxavierm/dynamic-forms-react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  HtmlForm,
  applyMask,
  createDefaultHtmlRegistry,
  extractMaskValue,
  normalizeNumericValue,
  parseLocaleNumber,
} from './index';

afterEach(cleanup);

function renderField(field: FieldSchema, value: unknown) {
  const schema: FormSchema = { id: 'specialized', fields: [field] };
  const store = new FormStore({ [field.name]: value });
  const view = render(<FormProvider store={store} schema={schema}><HtmlForm /></FormProvider>);
  return { store, view };
}

describe('Phase 6 numeric contracts', () => {
  it('parses locale separators, negatives, and intermediate invalid input', () => {
    expect(parseLocaleNumber('1.234,56', 'de-DE')).toBe(1234.56);
    expect(parseLocaleNumber('(1,234.50)', 'en-US')).toBe(-1234.5);
    expect(parseLocaleNumber('-')).toBeUndefined();
    expect(parseLocaleNumber('1,2,3', 'en-US')).toBe(123);
  });

  it('clamps, rounds to step, and applies precision predictably', () => {
    expect(normalizeNumericValue(10.126, { minimum: 0, maximum: 10, precision: 2 })).toBe(10);
    expect(normalizeNumericValue(1.26, { step: 0.5, precision: 2 })).toBe(1.5);
    expect(normalizeNumericValue(-4.444, { precision: 2 })).toBe(-4.44);
  });

  it('separates localized currency display text from stored numeric values', async () => {
    const { store, view } = renderField({
      name: 'amount', type: 'currency', label: 'Amount',
      config: { locale: 'de-DE', currency: 'EUR', precision: 2 },
    }, 10);
    const input = view.getByRole('textbox', { name: 'Amount' }) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '-' } });
    expect(store.getValue('amount')).toBe(10);
    fireEvent.change(input, { target: { value: '-12,5' } });
    expect(store.getValue('amount')).toBe(-12.5);
    fireEvent.blur(input);
    await waitFor(() => expect(input.value).toContain('12,50'));
    expect(input.value).toContain('€');
  });

  it('stores percentage points and clamps them on blur', async () => {
    const { store, view } = renderField({
      name: 'rate', type: 'percentage', label: 'Rate',
      config: { min: 0, max: 100, precision: 1 },
    }, 150);
    const input = view.getByRole('textbox', { name: 'Rate' }) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    await waitFor(() => expect(store.getValue('rate')).toBe(100));
    expect(input.value).toContain('100.0%');
  });
});

describe('Phase 6 specialized controls', () => {
  it('registers the complete specialized inventory', () => {
    const registry = createDefaultHtmlRegistry();
    for (const type of ['currency', 'percentage', 'slider', 'range-slider', 'rating', 'phone', 'otp', 'pin', 'mask']) {
      expect(registry[type]).toBeDefined();
    }
  });

  it('updates slider, range slider, and rating values', () => {
    let result = renderField({ name: 'volume', type: 'slider', label: 'Volume', config: { min: 0, max: 10, step: 2 } }, 2);
    fireEvent.change(result.view.getByRole('slider', { name: 'Volume' }), { target: { value: '6' } });
    expect(result.store.getValue('volume')).toBe(6);
    result.view.unmount();

    result = renderField({ name: 'range', type: 'range-slider', label: 'Range', config: { min: 0, max: 100 } }, [20, 80]);
    const sliders = result.view.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '30' } });
    expect(result.store.getValue('range')).toEqual([30, 80]);
    result.view.unmount();

    result = renderField({ name: 'score', type: 'rating', label: 'Score', config: { maxRating: 5 } }, 1);
    fireEvent.click(result.view.getByRole('radio', { name: '4 of 5' }));
    expect(result.store.getValue('score')).toBe(4);
  });

  it('supports phone, OTP paste, and secret PIN input', () => {
    let result = renderField({ name: 'phone', type: 'phone', label: 'Phone' }, '');
    fireEvent.change(result.view.getByRole('textbox', { name: 'Phone' }), { target: { value: '+91 98765 43210' } });
    expect(result.store.getValue('phone')).toBe('+91 98765 43210');
    result.view.unmount();

    result = renderField({ name: 'otp', type: 'otp', label: 'Code', config: { length: 6 } }, '');
    const digits = result.view.getAllByLabelText(/Code digit/);
    fireEvent.paste(digits[0], { clipboardData: { getData: () => '12a3456' } });
    expect(result.store.getValue('otp')).toBe('123456');
    result.view.unmount();

    result = renderField({ name: 'pin', type: 'pin', label: 'PIN', config: { length: 4 } }, '12');
    expect((result.view.getByLabelText('PIN digit 1') as HTMLInputElement).type).toBe('password');
  });

  it('keeps masked storage raw and display formatted', () => {
    const mask = '(000) 000-0000';
    expect(applyMask('1234567890', mask)).toBe('(123) 456-7890');
    expect(extractMaskValue('(123) 456-7890', mask)).toBe('1234567890');
    const { store, view } = renderField({ name: 'tax', type: 'mask', label: 'Tax', config: { mask: '00-00' } }, '1234');
    const input = view.getByRole('textbox', { name: 'Tax' }) as HTMLInputElement;
    expect(input.value).toBe('12-34');
    fireEvent.change(input, { target: { value: '98-76' } });
    expect(store.getValue('tax')).toBe('9876');
  });
});
