// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormStore } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { MuiDateField, MuiDateRangeField, MuiMonthField, MuiRangeSlider, MuiRating, MuiSlider, MuiYearField } from './index';

afterEach(cleanup);

function provider(store: FormStore, name: string, type: string, child: React.ReactNode) {
  return <FormProvider store={store} schema={{ id: name, fields: [{ name, type }] }}>{child}</FormProvider>;
}

describe('@dynamic-forms/mui remaining Phase 3 controls', () => {
  it('rejects dates matched by a disabled-date rule', () => {
    const store = new FormStore({ holiday: undefined });
    render(provider(store, 'holiday', 'date', <MuiDateField name="holiday" label="Holiday" isDateDisabled={(value) => value.endsWith('-25')} />));

    fireEvent.change(screen.getByLabelText('Holiday'), { target: { value: '2026-12-25' } });
    expect(store.getValue('holiday')).toBeUndefined();
    expect(screen.getByText('This date is unavailable')).toBeTruthy();
  });

  it('stores ranges canonically and constrains the end to the selected start', () => {
    const store = new FormStore({ period: undefined });
    render(provider(store, 'period', 'date-range', <MuiDateRangeField name="period" label="Period" />));

    const start = screen.getByLabelText('Start date') as HTMLInputElement;
    const end = screen.getByLabelText('End date') as HTMLInputElement;
    fireEvent.change(start, { target: { value: '2026-08-01' } });
    expect(store.getValue('period')).toEqual(['2026-08-01', undefined]);
    expect(end.min).toBe('2026-08-01');
    fireEvent.change(end, { target: { value: '2026-08-31' } });
    expect(store.getValue('period')).toEqual(['2026-08-01', '2026-08-31']);
  });

  it('stores month strings and numeric years without display leakage', () => {
    const store = new FormStore({ month: undefined, year: undefined });
    render(
      <FormProvider store={store} schema={{ id: 'calendar', fields: [{ name: 'month', type: 'month' }, { name: 'year', type: 'year' }] }}>
        <MuiMonthField name="month" label="Month" />
        <MuiYearField name="year" label="Year" min={2000} max={2030} />
      </FormProvider>,
    );

    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-08' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2026' } });
    expect(store.getValue('month')).toBe('2026-08');
    expect(store.getValue('year')).toBe(2026);
  });

  it('renders a labeled slider from canonical numeric state', () => {
    const store = new FormStore({ score: 40 });
    render(provider(store, 'score', 'slider', <MuiSlider name="score" label="Score" min={0} max={100} />));

    const slider = screen.getByRole('slider', { name: 'Score' }) as HTMLInputElement;
    expect(slider.value).toBe('40');
    expect(slider.min).toBe('0');
    expect(slider.max).toBe('100');
  });

  it('renders two ordered range-slider thumbs', () => {
    const store = new FormStore({ range: [20, 80] });
    render(provider(store, 'range', 'range-slider', <MuiRangeSlider name="range" label="Range" />));

    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect((sliders[0] as HTMLInputElement).value).toBe('20');
    expect((sliders[1] as HTMLInputElement).value).toBe('80');
  });

  it('stores rating selection as a number', () => {
    const store = new FormStore({ satisfaction: undefined });
    render(provider(store, 'satisfaction', 'rating', <MuiRating name="satisfaction" label="Satisfaction" />));

    fireEvent.click(screen.getByLabelText('4 of 5'));
    expect(store.getValue('satisfaction')).toBe(4);
  });
});
