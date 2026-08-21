// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormStore } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import {
  MuiCurrencyField,
  MuiDateField,
  MuiDateTimeField,
  MuiPercentageField,
  MuiTimeField,
  clampNumber,
  formatTemporalInput,
  parseLocaleNumber,
  parseTemporalInput,
} from './index';

afterEach(cleanup);

describe('@dynamic-forms/mui Phase 3 value adapters', () => {
  it('normalizes empty and populated temporal values', () => {
    expect(parseTemporalInput('')).toBeUndefined();
    expect(parseTemporalInput('2026-08-22')).toBe('2026-08-22');
    expect(formatTemporalInput(undefined)).toBe('');
  });

  it('parses locale-specific numbers without storing formatted text', () => {
    expect(parseLocaleNumber('1.234,50 €', 'de-DE')).toBe(1234.5);
    expect(parseLocaleNumber('(1,234.50)', 'en-US')).toBe(-1234.5);
    expect(parseLocaleNumber('not a number', 'en-US')).toBeUndefined();
  });

  it('clamps numeric values at configured boundaries', () => {
    expect(clampNumber(120, 0, 100)).toBe(100);
    expect(clampNumber(-5, 0, 100)).toBe(0);
  });
});

describe('@dynamic-forms/mui Phase 3 P0 controls', () => {
  it.each([
    ['Date', MuiDateField, '2026-08-22'],
    ['Time', MuiTimeField, '14:30'],
    ['Date time', MuiDateTimeField, '2026-08-22T14:30'],
  ] as const)('stores %s as a canonical string and clears to undefined', (label, Component, value) => {
    const name = label.toLowerCase().replace(' ', '-');
    const store = new FormStore({ [name]: undefined });
    render(
      <FormProvider store={store} schema={{ id: name, fields: [{ name, type: 'text' }] }}>
        <Component name={name} label={label} />
      </FormProvider>,
    );

    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value } });
    expect(store.getValue(name)).toBe(value);
    fireEvent.change(input, { target: { value: '' } });
    expect(store.getValue(name)).toBeUndefined();
  });

  it('maps date bounds and read-only state to the native input', () => {
    render(
      <FormProvider schema={{ id: 'date', fields: [{ name: 'date', type: 'date' }] }} defaultValues={{ date: '' }}>
        <MuiDateField name="date" label="Date" min="2026-01-01" max="2026-12-31" readOnly />
      </FormProvider>,
    );

    const input = screen.getByLabelText('Date') as HTMLInputElement;
    expect(input.min).toBe('2026-01-01');
    expect(input.max).toBe('2026-12-31');
    expect(input.readOnly).toBe(true);
  });

  it('stores currency as a number and clamps it on blur', () => {
    const store = new FormStore({ price: undefined });
    render(
      <FormProvider store={store} schema={{ id: 'currency', fields: [{ name: 'price', type: 'currency' }] }}>
        <MuiCurrencyField name="price" label="Price" locale="en-US" currency="USD" max={100} />
      </FormProvider>,
    );

    const input = screen.getByLabelText('Price') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '125.50' } });
    expect(store.getValue('price')).toBe(125.5);
    fireEvent.blur(input);
    expect(store.getValue('price')).toBe(100);
    expect(input.value).toBe('$100.00');
  });

  it('stores percentage points as a number and formats only the display', () => {
    const store = new FormStore({ completion: undefined });
    render(
      <FormProvider store={store} schema={{ id: 'percentage', fields: [{ name: 'completion', type: 'percentage' }] }}>
        <MuiPercentageField name="completion" label="Completion" />
      </FormProvider>,
    );

    const input = screen.getByLabelText('Completion') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '42.5' } });
    expect(store.getValue('completion')).toBe(42.5);
    fireEvent.blur(input);
    expect(input.value).toBe('42.5%');
  });
});
