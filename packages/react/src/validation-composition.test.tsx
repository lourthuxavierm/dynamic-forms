/** @vitest-environment happy-dom */
import { act, cleanup, render } from '@testing-library/react';
import { FormStore, type FormErrors, type FormSchema, type FormValidator } from '@dynamic-form-engine/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormProvider, useFormActions } from './index';

afterEach(() => cleanup());

// Mirrors a whole-object schema validator (such as createZodFormValidator):
// it reports errors for every path, visible or not.
type Values = { kind: string; company: string; email: string; billing?: { vat: string } };
const schema: FormSchema = {
  id: 'composition',
  fields: [
    { name: 'kind', type: 'select' },
    { name: 'company', type: 'text', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' } },
    { name: 'email', type: 'email', validation: { required: true } },
    { name: 'billing', type: 'object', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' }, fields: [{ name: 'vat', type: 'text' }] },
  ],
};
const wholeObjectValidator: FormValidator<Values> = (values) => {
  const errors: FormErrors = {};
  if (!values.company) errors.company = 'Company is required';
  if (!values.billing?.vat) errors['billing.vat'] = 'VAT is required';
  if (!String(values.email).includes('@')) errors.email = 'Enter a valid email';
  if (values.email === 'taken@example.com') errors._form = 'Account already exists';
  return errors;
};

function setup(values: Values, props: Partial<Parameters<typeof FormProvider<Values>>[0]> = {}) {
  const store = new FormStore<Values>(values);
  let actions!: ReturnType<typeof useFormActions>;
  function Actions() { actions = useFormActions(); return null; }
  render(<FormProvider<Values> store={store} schema={schema} formValidator={wholeObjectValidator} {...props}><Actions /></FormProvider>);
  return { store, actions: () => actions };
}

describe('composed form validator and hidden fields', () => {
  it('ignores errors for fields and objects hidden by visibleWhen', async () => {
    const onSubmit = vi.fn();
    const { store, actions } = setup({ kind: 'person', company: '', email: 'ada@example.com' }, { onSubmit });
    await act(async () => { expect(await actions().validateForm()).toBe(true); });
    await act(async () => { await actions().submit(); });
    expect(store.getState().errors).toEqual({});
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('keeps errors once the fields are visible, and root errors always', async () => {
    const { store, actions } = setup({ kind: 'business', company: '', email: 'taken@example.com' });
    await act(async () => { await actions().validateForm(); });
    expect(store.getState().errors).toEqual({ company: 'Company is required', 'billing.vat': 'VAT is required', _form: 'Account already exists' });
  });

  it('keeps hidden-field errors when validateHiddenFields is set', async () => {
    const { store, actions } = setup({ kind: 'person', company: '', email: 'ada@example.com' }, { validateHiddenFields: true });
    await act(async () => { await actions().validateForm(); });
    expect(Object.keys(store.getState().errors).sort()).toEqual(['billing.vat', 'company']);
  });
});

describe('field-level validation with a composed form validator', () => {
  it('keeps the form validator error on a still-invalid field instead of clearing it', async () => {
    const { store, actions } = setup({ kind: 'person', company: '', email: 'bad' });
    await act(async () => { await actions().validateForm(); });
    expect(store.getState().errors.email).toBe('Enter a valid email');

    await act(async () => { expect(await actions().validateField('email')).toBe(false); });
    expect(store.getState().errors.email).toBe('Enter a valid email');

    act(() => store.setValue('email', 'ada@example.com'));
    await act(async () => { expect(await actions().validateField('email')).toBe(true); });
    expect(store.getState().errors.email).toBeUndefined();
  });

  it('prefers the form validator message over the schema rule, as composition does', async () => {
    const { store, actions } = setup({ kind: 'person', company: '', email: '' });
    await act(async () => { await actions().validateField('email'); });
    expect(store.getState().errors.email).toBe('Enter a valid email');
  });

  it('ignores the form validator for hidden fields during field validation', async () => {
    const { store, actions } = setup({ kind: 'person', company: '', email: 'ada@example.com' });
    await act(async () => { expect(await actions().validateField('company')).toBe(true); });
    expect(store.getState().errors).toEqual({});
  });

  it('aborts a superseded field run and applies only the latest result', async () => {
    const signals: AbortSignal[] = [];
    const releases: Array<(errors: FormErrors) => void> = [];
    const slow: FormValidator<Values> = (_values, context) => {
      if (context?.signal) signals.push(context.signal);
      return new Promise<FormErrors>((resolve) => releases.push(resolve));
    };
    const { store, actions } = setup({ kind: 'person', company: '', email: 'x' }, { formValidator: slow });
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    await act(async () => { first = actions().validateField('email'); await Promise.resolve(); });
    await act(async () => { second = actions().validateField('email'); await Promise.resolve(); });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);

    await act(async () => { releases[1]({}); await second; releases[0]({ email: 'stale' }); await first; });
    expect(store.getState().errors.email).toBeUndefined();
  });

  it('reports a failing form validator through onError without an unhandled rejection', async () => {
    const onError = vi.fn();
    const failure = new Error('validator crashed');
    const { store, actions } = setup({ kind: 'person', company: '', email: 'a@b.c' }, { onError, formValidator: () => { throw failure; } });
    await act(async () => { expect(await actions().validateField('email')).toBe(false); });
    expect(onError).toHaveBeenCalledWith(failure);
    expect(store.getState().errors).toEqual({});
  });
});
