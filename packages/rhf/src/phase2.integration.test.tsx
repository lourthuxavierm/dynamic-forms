// @vitest-environment happy-dom
import { useState } from 'react';
import { act } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FormSchema } from '@dynamic-form-engine/core';
import { useFormState as useDynamicFormState } from '@dynamic-form-engine/react';
import type { Mode } from 'react-hook-form';
import { createRHFResolver, DynamicFormRHFProvider, RHFField, useDynamicFormRHF } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(cleanup);

type Values = { name: string };
const schema: FormSchema = {
  id: 'rhf-phase-2',
  fields: [{ name: 'name', type: 'text', label: 'Name', validation: { required: true, minLength: 3 } }],
};

function ValidationForm({ onValid = () => undefined }: { onValid?: (values: Values) => void }) {
  const { methods } = useDynamicFormRHF<Values>();
  const coreErrors = useDynamicFormState((state) => state.errors);
  const [, renderState] = useState(0);
  return <form onSubmit={methods.handleSubmit(onValid)}>
    <RHFField<Values, 'name'> name="name" render={({ field, fieldState }) => <>
      <label htmlFor="phase2-name">Name</label>
      <input id="phase2-name" {...field} value={field.value ?? ''} />
      {fieldState.error ? <span role="alert">{fieldState.error.message}</span> : null}
    </>} />
    <button type="submit">Submit</button>
    <button type="button" onClick={() => void methods.trigger().then(() => renderState((value) => value + 1))}>Validate manually</button>
    <output aria-label="Core errors">{JSON.stringify(coreErrors)}</output>
  </form>;
}

function Harness({ mode = 'onSubmit', onValid }: { mode?: Mode; onValid?: (values: Values) => void }) {
  return <DynamicFormRHFProvider<Values>
    schema={schema}
    formOptions={{ defaultValues: { name: '' }, mode, resolver: createRHFResolver<Values>(schema) }}
  >
    <ValidationForm onValid={onValid} />
  </DynamicFormRHFProvider>;
}

describe('RHF Phase 2 integration', () => {
  it('projects resolver errors to Dynamic Forms and focuses the first invalid field', async () => {
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);
    fireEvent.click(screen.getByText('Submit'));
    await screen.findByText('Name is required');
    await waitFor(() => expect(screen.getByLabelText('Core errors').textContent).toContain('Name is required'));
    expect(document.activeElement).toBe(screen.getByLabelText('Name'));
    expect(onValid).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith({ name: 'Ada' }, expect.anything()));
    await waitFor(() => expect(screen.getByLabelText('Core errors').textContent).toBe('{}'));
  });

  it('supports onBlur validation and clears corrected errors', async () => {
    render(<Harness mode="onBlur" />);
    fireEvent.blur(screen.getByLabelText('Name'));
    await screen.findByText('Name is required');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.blur(screen.getByLabelText('Name'));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('supports onChange and manual validation modes', async () => {
    const view = render(<Harness mode="onChange" />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'a' } });
    await screen.findByText('Name must be at least 3 characters');
    view.unmount();

    render(<Harness mode="onSubmit" />);
    await act(async () => fireEvent.click(screen.getByText('Validate manually')));
    await screen.findByText('Name is required');
  });
});