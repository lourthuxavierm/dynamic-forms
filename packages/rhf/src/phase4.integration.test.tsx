// @vitest-environment happy-dom
import { useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { FormSchema } from '@dynamic-form-engine/core';
import {
  DynamicFormRHFProvider,
  RHFField,
  serializeRHFValues,
  useDynamicFormRHF,
  useRHFFieldArray,
  useRHFFormActions,
} from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(cleanup);

type Values = {
  profile: { city: string };
  contacts: Array<{ name: string }>;
  upload: File | null;
};

const defaults: Values = {
  profile: { city: 'Mumbai' },
  contacts: [{ name: 'Ada' }, { name: 'Grace' }],
  upload: null,
};

const schema: FormSchema = {
  id: 'rhf-phase-4',
  fields: [
    { name: 'profile.city', type: 'text' },
    { name: 'contacts', type: 'array' },
    { name: 'upload', type: 'file' },
  ],
};

function Phase4Fields({ onSubmit }: { onSubmit?: (values: Values) => void }) {
  const { methods, store } = useDynamicFormRHF<Values>();
  const actions = useRHFFormActions<Values>();
  const array = useRHFFieldArray<Values, 'contacts'>({ name: 'contacts' });
  const values = useWatch<Values>({ control: methods.control });
  const state = useFormState({ control: methods.control });
  const [, rerender] = useState(0);

  return <form onSubmit={methods.handleSubmit((submitted) => onSubmit?.(submitted))}>
    <RHFField<Values, 'profile.city'>
      name="profile.city"
      render={({ field }) => <input aria-label="City" {...field} />}
    />
    <input type="hidden" aria-label="Upload" {...methods.register('upload')} />
    {array.fields.map((row, index) => (
      <input
        aria-label={`Contact ${index}`}
        key={row.id}
        {...methods.register(`contacts.${index}.name` as const)}
      />
    ))}
    <output aria-label="Ids">{array.fields.map((field) => field.id).join(',')}</output>
    <output aria-label="Values">{JSON.stringify(values)}</output>
    <output aria-label="Core">{JSON.stringify(store.getValues())}</output>
    <output aria-label="State">{JSON.stringify({
      dirty: state.isDirty,
      touched: state.touchedFields,
      errors: Array.isArray(state.errors.contacts)
        ? state.errors.contacts.map((entry) => entry?.name?.message ?? null)
        : [],
    })}</output>
    <button type="button" onClick={() => array.append({ name: 'Linus' })}>Append</button>
    <button type="button" onClick={() => array.move(0, array.fields.length - 1)}>Move first</button>
    <button type="button" onClick={() => array.swap(0, 1)}>Swap first</button>
    <button type="button" onClick={() => array.replace([{ name: 'Only' }])}>Replace</button>
    <button type="button" onClick={() => array.remove(0)}>Remove first</button>
    <button type="button" onClick={() => actions.setError('contacts.0.name', { type: 'manual', message: 'Bad contact' })}>Set row error</button>
    <button type="button" onClick={() => actions.clearErrors('contacts')}>Clear errors</button>
    <button type="button" onClick={() => actions.setFocus('profile.city')}>Focus city</button>
    <button type="button" onClick={() => actions.resetField('profile.city')}>Reset city</button>
    <button type="button" onClick={() => actions.reset()}>Reset form</button>
    <button type="button" onClick={() => {
      methods.setValue('upload', new File(['data'], 'proof.txt', { type: 'text/plain', lastModified: 7 }), {
        shouldDirty: true,
        shouldTouch: true,
      });
    }}>Set file</button>
    <button type="button" onClick={() => actions.resetField('upload')}>Reset file</button>
    <button type="button" onClick={() => rerender((value) => value + 1)}>Refresh projection</button>
    <button type="submit">Submit</button>
  </form>;
}

function Harness({ onSubmit }: { onSubmit?: (values: Values) => void }) {
  return <DynamicFormRHFProvider<Values>
    schema={schema}
    formOptions={{ defaultValues: defaults }}
  >
    <Phase4Fields onSubmit={onSubmit} />
  </DynamicFormRHFProvider>;
}

function readValues(label = 'Values'): Values {
  return JSON.parse(screen.getByLabelText(label).textContent ?? '{}') as Values;
}

describe('RHF Phase 4 structural fields', () => {
  it('preserves row identity across append, move, and swap', async () => {
    render(<Harness />);
    const initial = screen.getByLabelText('Ids').textContent?.split(',') ?? [];

    fireEvent.click(screen.getByText('Append'));
    await waitFor(() => expect(screen.getAllByLabelText(/Contact /)).toHaveLength(3));
    const appended = screen.getByLabelText('Ids').textContent?.split(',') ?? [];
    expect(appended.slice(0, 2)).toEqual(initial);

    fireEvent.click(screen.getByText('Move first'));
    await waitFor(() => expect(readValues().contacts.map((item) => item.name)).toEqual(['Grace', 'Linus', 'Ada']));
    const moved = screen.getByLabelText('Ids').textContent?.split(',') ?? [];
    expect(moved).toEqual([appended[1], appended[2], appended[0]]);

    fireEvent.click(screen.getByText('Swap first'));
    await waitFor(() => expect(readValues().contacts.map((item) => item.name)).toEqual(['Linus', 'Grace', 'Ada']));
    expect(screen.getByLabelText('Ids').textContent?.split(',')).toEqual([appended[2], appended[1], appended[0]]);
  });

  it('moves indexed errors with rows and removes orphaned values and state', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Set row error'));
    await waitFor(() => expect(JSON.parse(screen.getByLabelText('State').textContent ?? '{}').errors).toEqual(['Bad contact']));

    fireEvent.click(screen.getByText('Move first'));
    await waitFor(() => expect(JSON.parse(screen.getByLabelText('State').textContent ?? '{}').errors).toEqual([null, 'Bad contact']));

    fireEvent.click(screen.getByText('Replace'));
    await waitFor(() => expect(readValues().contacts).toEqual([{ name: 'Only' }]));
    fireEvent.click(screen.getByText('Refresh projection'));
    expect(readValues('Core').contacts).toEqual([{ name: 'Only' }]);
    expect(JSON.parse(screen.getByLabelText('State').textContent ?? '{}').errors ?? []).toEqual([]);
  });

  it('submits nested object and array values', async () => {
    let submitted: Values | undefined;
    render(<Harness onSubmit={(values) => { submitted = values; }} />);
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Pune' } });
    fireEvent.change(screen.getByLabelText('Contact 1'), { target: { value: 'Hopper' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(submitted).toEqual({
      profile: { city: 'Pune' },
      contacts: [{ name: 'Ada' }, { name: 'Hopper' }],
      upload: null,
    }));
  });
});

describe('RHF Phase 4 lifecycle and files', () => {
  it('resets a field and the full form including dirty, touched, and errors', async () => {
    render(<Harness />);
    const city = screen.getByLabelText('City');
    fireEvent.click(screen.getByText('Focus city'));
    await waitFor(() => expect(document.activeElement).toBe(city));
    fireEvent.change(city, { target: { value: 'Delhi' } });
    fireEvent.blur(city);
    fireEvent.click(screen.getByText('Set row error'));

    fireEvent.click(screen.getByText('Reset city'));
    await waitFor(() => expect(city).toHaveProperty('value', 'Mumbai'));
    fireEvent.change(screen.getByLabelText('Contact 0'), { target: { value: 'Changed' } });
    fireEvent.click(screen.getByText('Reset form'));

    await waitFor(() => expect(readValues()).toEqual(defaults));
    expect(JSON.parse(screen.getByLabelText('State').textContent ?? '{}')).toEqual({
      dirty: false,
      touched: {},
      errors: [],
    });
  });

  it('resets files and serializes them with explicit strategies', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Set file'));
    await waitFor(() => expect(JSON.parse(screen.getByLabelText('State').textContent ?? '{}').dirty).toBe(true));

    const file = new File(['data'], 'proof.txt', { type: 'text/plain', lastModified: 7 });
    expect(serializeRHFValues({ file })).toEqual({
      file: { name: 'proof.txt', size: 4, type: 'text/plain', lastModified: 7 },
    });
    expect(serializeRHFValues({ file }, { fileStrategy: 'omit' })).toEqual({});
    expect((serializeRHFValues({ file }, { fileStrategy: 'preserve' }) as { file: File }).file).toBe(file);

    fireEvent.click(screen.getByText('Reset file'));
    await waitFor(() => expect(readValues().upload).toBeNull());
  });
});
