// @vitest-environment happy-dom
import { StrictMode, useEffect } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import type { FormStore, FormSchema } from '@dynamic-form-engine/core';
import {
  DynamicFormRHFProvider,
  RHFField,
  useDynamicFormRHF,
} from './index';

type Values = {
  name: string;
  age: number;
  active: boolean;
  address: { city: string };
};

afterEach(cleanup);

const defaults: Values = { name: 'Ada', age: 30, active: false, address: { city: 'London' } };
const schema: FormSchema = {
  id: 'rhf-phase-1',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'age', type: 'number' },
    { name: 'active', type: 'checkbox' },
    { name: 'address.city', type: 'text' },
  ],
};

function Fields() {
  const values = useWatch<Values>();
  const { methods, store } = useDynamicFormRHF<Values>();
  return <>
    <RHFField<Values, 'name'> name="name" render={({ field }) => (
      <input aria-label="Name" {...field} value={field.value ?? ''} />
    )} />
    <RHFField<Values, 'age'> name="age" render={({ field }) => (
      <input aria-label="Age" name={field.name} ref={field.ref} type="number" value={field.value}
        onBlur={field.onBlur} onChange={(event) => field.onChange(Number(event.target.value))} />
    )} />
    <RHFField<Values, 'active'> name="active" render={({ field }) => (
      <input aria-label="Active" name={field.name} ref={field.ref} type="checkbox" checked={field.value}
        onBlur={field.onBlur} onChange={(event) => field.onChange(event.target.checked)} />
    )} />
    <RHFField<Values, 'address.city'> name="address.city" render={({ field }) => (
      <input aria-label="City" {...field} value={field.value ?? ''} />
    )} />
    <button onClick={() => methods.setValue('name', 'Grace')}>Set through RHF</button>
    <button onClick={() => store.setValue('address.city', 'Paris')}>Set through Core projection</button>
    <output aria-label="Values">{JSON.stringify(values)}</output>
  </>;
}

function InternalHarness({ children = <Fields /> }: { children?: React.ReactNode }) {
  return <DynamicFormRHFProvider<Values> schema={schema} formOptions={{ defaultValues: defaults }}>
    {children}
  </DynamicFormRHFProvider>;
}

function ExternalHarness({ capture }: { capture: (methods: UseFormReturn<Values>) => void }) {
  const methods = useForm<Values>({ defaultValues: defaults });
  useEffect(() => capture(methods), [capture, methods]);
  return <DynamicFormRHFProvider schema={schema} methods={methods}><Fields /></DynamicFormRHFProvider>;
}

describe('RHF Phase 1 bridge', () => {
  it('preserves typed values and nested paths through controller-backed fields', () => {
    render(<InternalHarness />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Lin' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '42' } });
    fireEvent.click(screen.getByLabelText('Active'));
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Delhi' } });

    expect(JSON.parse(screen.getByLabelText('Values').textContent ?? '{}')).toEqual({
      name: 'Lin', age: 42, active: true, address: { city: 'Delhi' },
    });
  });

  it('supports internal RHF updates and renderer projection updates without loops', () => {
    render(<InternalHarness />);
    fireEvent.click(screen.getByText('Set through RHF'));
    expect(screen.getByLabelText('Name')).toHaveProperty('value', 'Grace');
    fireEvent.click(screen.getByText('Set through Core projection'));
    expect(screen.getByLabelText('City')).toHaveProperty('value', 'Paris');
  });

  it('accepts an external UseFormReturn instance', () => {
    let methods: UseFormReturn<Values> | undefined;
    render(<ExternalHarness capture={(value) => { methods = value; }} />);
    act(() => methods?.setValue('name', 'External'));
    expect(screen.getByLabelText('Name')).toHaveProperty('value', 'External');
  });

  it('cleans subscriptions and emits one logical projection update in Strict Mode', () => {
    const listener = vi.fn();
    let store: FormStore<Values> | undefined;
    function Probe() {
      const context = useDynamicFormRHF<Values>();
      store = context.store;
      useEffect(() => context.store.on('valueChange', listener), [context.store]);
      return <RHFField<Values, 'name'> name="name" render={({ field }) => <input aria-label="Strict name" {...field} />} />;
    }
    const view = render(<StrictMode><InternalHarness><Probe /></InternalHarness></StrictMode>);
    listener.mockClear();
    fireEvent.change(screen.getByLabelText('Strict name'), { target: { value: 'One update' } });
    expect(store?.getValue('name')).toBe('One update');
    expect(listener).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(() => store?.setValue('name', 'After unmount')).not.toThrow();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});