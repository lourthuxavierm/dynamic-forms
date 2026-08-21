// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormStore } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { MuiCheckboxGroup, MuiIntegerField, MuiPasswordField, MuiTextField } from './index';

afterEach(cleanup);

describe('@dynamic-forms/mui Phase 2 controls', () => {
  it('toggles password visibility without changing its stored value', () => {
    const store = new FormStore({ password: 'secret' });
    render(<FormProvider store={store} schema={{ id: 'password', fields: [{ name: 'password', type: 'password' }] }}><MuiPasswordField name="password" label="Password" /></FormProvider>);

    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
    expect(input.autocomplete).toBe('current-password');
    fireEvent.click(screen.getByLabelText('Show password'));
    expect(input.type).toBe('text');
    expect(store.getValue('password')).toBe('secret');
  });

  it('normalizes integer input and represents an empty value as undefined', () => {
    const store = new FormStore({ count: 2 });
    render(<FormProvider store={store} schema={{ id: 'integer', fields: [{ name: 'count', type: 'integer' }] }}><MuiIntegerField name="count" label="Count" /></FormProvider>);

    const input = screen.getByLabelText('Count');
    fireEvent.change(input, { target: { value: '12' } });
    expect(store.getValue('count')).toBe(12);
    fireEvent.change(input, { target: { value: '' } });
    expect(store.getValue('count')).toBeUndefined();
  });

  it('honors disabled options in a checkbox group', () => {
    render(<FormProvider schema={{ id: 'choices', fields: [{ name: 'roles', type: 'checkbox-group' }] }} defaultValues={{ roles: [] }}><MuiCheckboxGroup name="roles" label="Roles" options={[{ label: 'Editor', value: 'editor' }, { label: 'Locked', value: 'locked', disabled: true }]} /></FormProvider>);

    expect((screen.getByLabelText('Locked') as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText('Editor') as HTMLInputElement).disabled).toBe(false);
  });

  it('renders required validation feedback after blur', async () => {
    render(<FormProvider schema={{ id: 'validation', fields: [{ name: 'email', type: 'email', validation: { required: true } }] }} defaultValues={{ email: '' }}><MuiTextField name="email" label="Email" /></FormProvider>);

    fireEvent.blur(screen.getByLabelText('Email'));
    await waitFor(() => expect(screen.getByText('email is required')).toBeTruthy());
  });
});