// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormStore, type FieldSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { MuiFieldRenderer, MuiMaskField, applyMask, createDefaultMuiRegistry, extractMaskValue } from './index';

afterEach(cleanup);

describe('@dynamic-forms/mui mask field', () => {
  it('is registered by the default registry', () => {
    expect(createDefaultMuiRegistry().mask).toBe(MuiMaskField);
  });

  it('formats display text while preserving an unformatted form value', () => {
    expect(applyMask('AB1234', 'AA-0000')).toBe('AB-1234');
    expect(extractMaskValue('AB-1234', 'AA-0000')).toBe('AB1234');

    const field: FieldSchema = { name: 'employeeCode', type: 'mask', label: 'Employee code', config: { mask: 'AA-0000' } };
    const store = new FormStore({ employeeCode: undefined });
    render(<FormProvider store={store} schema={{ id: 'mask', fields: [field] }}><MuiFieldRenderer field={field} registry={createDefaultMuiRegistry()} /></FormProvider>);

    const input = screen.getByLabelText('Employee code') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'AB-1234' } });
    expect(store.getValue('employeeCode')).toBe('AB1234');
    expect(input.value).toBe('AB-1234');
  });

  it('renders a configuration error instead of throwing when mask is missing', () => {
    render(<FormProvider schema={{ id: 'missing-mask', fields: [{ name: 'code', type: 'mask' }] }}><MuiMaskField name="code" label="Code" /></FormProvider>);
    expect(screen.getByText('Mask configuration is required.')).toBeTruthy();
  });
});
