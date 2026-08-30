/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FieldSchema, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  HtmlForm,
  createDefaultHtmlRegistry,
  createHtmlTemporalField,
  normalizeDateOnly,
  normalizeLocalDateTime,
  normalizeTimeOnly,
  parseLocalDateTime,
} from './index';

afterEach(cleanup);

function renderField(field: FieldSchema, value: unknown, registry?: Record<string, any>) {
  const schema: FormSchema = { id: 'temporal', fields: [field] };
  const store = new FormStore({ [field.name]: value });
  const view = render(<FormProvider store={store} schema={schema}><HtmlForm registry={registry} /></FormProvider>);
  return { store, view };
}

describe('Phase 7 temporal value contracts', () => {
  it('normalizes date-only values without UTC conversion', () => {
    const local = new Date(2025, 2, 9, 23, 30, 0);
    expect(normalizeDateOnly(local)).toBe('2025-03-09');
    expect(normalizeDateOnly('2024-02-29')).toBe('2024-02-29');
    expect(normalizeDateOnly('2025-02-29')).toBeUndefined();
  });

  it('normalizes time and local datetime while rejecting zoned timestamps', () => {
    expect(normalizeTimeOnly('7:05')).toBe('07:05');
    expect(normalizeTimeOnly('23:59:07')).toBe('23:59:07');
    expect(normalizeTimeOnly('24:00')).toBeUndefined();
    expect(normalizeLocalDateTime('2025-11-02T01:30')).toBe('2025-11-02T01:30');
    expect(normalizeLocalDateTime('2025-11-02T01:30Z')).toBeUndefined();
  });

  it('round-trips local calendar components across DST boundary dates', () => {
    for (const value of ['2025-03-09T01:30', '2025-11-02T01:30']) {
      const parsed = parseLocalDateTime(value);
      expect(parsed).toBeDefined();
      expect(normalizeLocalDateTime(parsed)).toBe(value + ':00');
    }
  });
});

describe('Phase 7 native temporal controls', () => {
  it('registers temporal ranges and applies native constraints', () => {
    const registry = createDefaultHtmlRegistry();
    expect(registry['date-range']).toBeDefined();
    expect(registry['time-range']).toBeDefined();
    expect(registry['datetime-range']).toBeDefined();
    const { view } = renderField({
      name: 'start', type: 'date', label: 'Start date',
      config: { minDate: '2025-01-01', maxDate: '2025-12-31' },
    }, '2025-06-15');
    const input = view.getByLabelText('Start date') as HTMLInputElement;
    expect(input.min).toBe('2025-01-01');
    expect(input.max).toBe('2025-12-31');
  });

  it('stores normalized date, time, and local datetime strings', () => {
    let result = renderField({ name: 'day', type: 'date', label: 'Day' }, '');
    fireEvent.change(result.view.getByLabelText('Day'), { target: { value: '2025-08-23' } });
    expect(result.store.getValue('day')).toBe('2025-08-23');
    result.view.unmount();

    result = renderField({ name: 'at', type: 'time', label: 'At' }, '');
    fireEvent.change(result.view.getByLabelText('At'), { target: { value: '09:45' } });
    expect(result.store.getValue('at')).toBe('09:45');
    result.view.unmount();

    result = renderField({ name: 'meeting', type: 'datetime', label: 'Meeting' }, '');
    fireEvent.change(result.view.getByLabelText('Meeting'), { target: { value: '2025-08-23T09:45' } });
    expect(result.store.getValue('meeting')).toBe('2025-08-23T09:45');
  });

  it('keeps range values ordered when endpoints cross', () => {
    const { store, view } = renderField({ name: 'period', type: 'date-range', label: 'Period' }, ['2025-05-10', '2025-05-20']);
    fireEvent.change(view.getByLabelText('End'), { target: { value: '2025-05-01' } });
    expect(store.getValue('period')).toEqual(['2025-05-01', '2025-05-01']);
    fireEvent.change(view.getByLabelText('Start'), { target: { value: '2025-05-15' } });
    expect(store.getValue('period')).toEqual(['2025-05-15', '2025-05-15']);
  });

  it('supports progressive enhancement without changing stored values', () => {
    const EnhancedDate = createHtmlTemporalField('date', ({ inputProps }) => <input {...inputProps} data-enhanced="calendar" />);
    const { store, view } = renderField({ name: 'day', type: 'enhanced-date', label: 'Day' }, '', { 'enhanced-date': EnhancedDate });
    const input = view.getByLabelText('Day');
    expect(input.getAttribute('data-enhanced')).toBe('calendar');
    fireEvent.change(input, { target: { value: '2025-12-31' } });
    expect(store.getValue('day')).toBe('2025-12-31');
  });
});
