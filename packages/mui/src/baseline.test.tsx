// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FormProvider } from '@dynamic-forms/react';
import {
  MuiFieldRenderer,
  MuiFieldShell,
  MuiFormRenderer,
  MuiTextField,
  createDefaultMuiRegistry,
} from './index';

describe('@dynamic-forms/mui baseline', () => {
  afterEach(cleanup);
  it('exports and registers the baseline controls', () => {
    const registry = createDefaultMuiRegistry();

    expect(registry.text).toBe(MuiTextField);
    expect(registry.select).toBeDefined();
    expect(registry.checkbox).toBeDefined();
    expect(registry.radio).toBeDefined();
    expect(registry.date).toBeDefined();
  });

  it('reports an actionable error for an unregistered field type', () => {
    expect(() => render(
      <MuiFieldRenderer
        field={{ name: 'unknown', type: 'not-registered' }}
        registry={{}}
      />,
    )).toThrow('No MUI component registered for field type "not-registered"');
  });

  it('connects a rendered MUI text field to form state', () => {
    render(
      <FormProvider schema={{ id: 'baseline', fields: [{ name: 'firstName', type: 'text' }] }} defaultValues={{ firstName: 'Ada' }}>
        <MuiTextField name="firstName" label="First name" />
      </FormProvider>,
    );

    const input = screen.getByLabelText('First name');
    expect((input as HTMLInputElement).value).toBe('Ada');

    fireEvent.change(input, { target: { value: 'Grace' } });
    expect((input as HTMLInputElement).value).toBe('Grace');
  });
  it('merges custom registry controls over defaults', () => {
    const CustomText = () => <div>Custom control</div>;
    const registry = createDefaultMuiRegistry({ text: CustomText });

    expect(registry.text).toBe(CustomText);
    expect(registry.select).toBeDefined();
  });

  it('renders schema fields through a group and grid layout', () => {
    const schema = {
      id: 'layout',
      fields: [
        { name: 'firstName', type: 'text', label: 'First name' },
        { name: 'lastName', type: 'text', label: 'Last name' },
      ],
    } as const;

    render(
      <FormProvider schema={schema} defaultValues={{ firstName: '', lastName: '' }}>
        <MuiFormRenderer
          schema={schema}
          registry={createDefaultMuiRegistry()}
          layout={[{ kind: 'group', label: 'Identity', children: [{ kind: 'grid', columns: 2, children: [{ kind: 'field', name: 'firstName' }, { kind: 'field', name: 'lastName' }] }] }]}
        />
      </FormProvider>,
    );

    expect(screen.getByText('Identity')).toBeTruthy();
    expect(screen.getByLabelText('First name')).toBeTruthy();
    expect(screen.getByLabelText('Last name')).toBeTruthy();
  });

  it('provides stable description and error aria associations from the field shell', () => {
    render(
      <FormProvider schema={{ id: 'shell', fields: [{ name: 'email', type: 'text' }] }} defaultValues={{ email: '' }}>
        <MuiFieldShell name="email" label="Email" description="We only use this for receipts">
          {(a11y) => <input aria-label="Email input" id={a11y.id} aria-describedby={a11y.ariaDescribedBy} aria-invalid={a11y.ariaInvalid} />}
        </MuiFieldShell>
      </FormProvider>,
    );

    const input = screen.getByLabelText('Email input');
    expect(input.getAttribute('aria-describedby')).toContain('-description');
  });
});
