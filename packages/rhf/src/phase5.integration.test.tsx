// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '@dynamic-form-engine/core';
import {
  defineRHFSchema,
  DynamicFormRHFProvider,
  RHFForm,
  type RHFControlProps,
  type RHFControlRegistry,
} from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

type Values = {
  profile: { city: string };
  contacts: Array<{ name: string }>;
};

const schema = defineRHFSchema<Values>({
  id: 'phase-5',
  fields: [
    {
      name: 'profile',
      type: 'object',
      label: 'Profile',
      fields: [{ name: 'city', type: 'text', label: 'City' }],
    },
    {
      name: 'contacts',
      type: 'array',
      label: 'Contacts',
      fields: [{ name: 'name', type: 'text', label: 'Contact name' }],
    },
  ],
});

function TextControl({
  schemaField,
  field,
  fieldState,
  dynamicState,
}: RHFControlProps<Values>) {
  return <label>
    {schemaField.label}
    <input
      aria-label={schemaField.label}
      {...field}
      value={String(field.value ?? '')}
      aria-invalid={fieldState.invalid}
      disabled={dynamicState.disabled}
      readOnly={dynamicState.readOnly}
    />
  </label>;
}

const registry: RHFControlRegistry<Values> = { text: TextControl };

describe('RHFForm', () => {
  it('renders nested schemas through custom controls and submits RHF values', async () => {
    const submit = vi.fn();
    render(
      <DynamicFormRHFProvider<Values>
        schema={schema}
        formOptions={{
          defaultValues: {
            profile: { city: 'Mumbai' },
            contacts: [{ name: 'Ada' }, { name: 'Grace' }],
          },
        }}
      >
        <RHFForm schema={schema} registry={registry} onSubmit={submit} submitLabel="Save" />
      </DynamicFormRHFProvider>,
    );

    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('Contacts')).toBeTruthy();
    expect(screen.getAllByLabelText('Contact name')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Pune' } });
    fireEvent.change(screen.getAllByLabelText('Contact name')[1], { target: { value: 'Hopper' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(submit).toHaveBeenCalledWith({
      profile: { city: 'Pune' },
      contacts: [{ name: 'Ada' }, { name: 'Hopper' }],
    }, expect.anything()));
  });

  it('honors prevented native submit events', () => {
    const submit = vi.fn();
    render(
      <DynamicFormRHFProvider<Values>
        schema={schema}
        formOptions={{ defaultValues: { profile: { city: '' }, contacts: [] } }}
      >
        <RHFForm
          registry={registry}
          onSubmit={submit}
          onNativeSubmit={(event) => event.preventDefault()}
        />
      </DynamicFormRHFProvider>,
    );
    fireEvent.click(screen.getByText('Submit'));
    expect(submit).not.toHaveBeenCalled();
  });
});

describe('RHF development diagnostics', () => {
  it('warns for nested adapter providers in development', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <DynamicFormRHFProvider<Values> schema={schema}>
        <DynamicFormRHFProvider<Values> schema={schema}>
          <span>nested</span>
        </DynamicFormRHFProvider>
      </DynamicFormRHFProvider>,
    );
    await waitFor(() => expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('Nested DynamicFormRHFProvider'),
    ));
  });

  it('reports missing controls in development and stays quiet in production', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const missingSchema: FormSchema = {
      id: 'missing',
      fields: [{ name: 'value', type: 'unregistered-control' }],
    };
    expect(() => render(
      <DynamicFormRHFProvider schema={missingSchema}>
        <RHFForm registry={{}} onSubmit={() => undefined} />
      </DynamicFormRHFProvider>,
    )).toThrow(/No RHF control registered/);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('unregistered-control'));

    cleanup();
    warning.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => render(
      <DynamicFormRHFProvider schema={missingSchema}>
        <RHFForm registry={{}} onSubmit={() => undefined} />
      </DynamicFormRHFProvider>,
    )).toThrow(/No RHF control registered/);
    expect(warning).not.toHaveBeenCalled();
  });
});
