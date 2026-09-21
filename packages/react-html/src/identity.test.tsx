/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider, type FieldComponentProps } from '@dynamic-form-engine/react';
import { act, useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HtmlForm } from './index';

afterEach(cleanup);

describe('HTML field identity', () => {
  it('keeps an id-backed control mounted across a data-name change and rebinds its value', () => {
    const mounted = vi.fn();
    const unmounted = vi.fn();
    function Control(props: FieldComponentProps) {
      useEffect(() => {
        mounted();
        return () => unmounted();
      }, []);
      return <input aria-label={props.name} value={String(props.value ?? '')} onChange={(event) => props.setValue(event.target.value)} />;
    }
    const first: FormSchema = { id: 'rename', fields: [{ id: 'field-1', name: 'oldName', type: 'custom' }] };
    const renamed: FormSchema = { id: 'rename', fields: [{ id: 'field-1', name: 'newName', type: 'custom' }] };
    const store = new FormStore({ oldName: 'old', newName: 'new' });
    const registry = { custom: Control };
    const view = render(<FormProvider schema={first} store={store}><HtmlForm registry={registry} /></FormProvider>);
    expect(mounted).toHaveBeenCalledTimes(1);
    view.rerender(<FormProvider schema={renamed} store={store}><HtmlForm registry={registry} /></FormProvider>);
    expect(unmounted).not.toHaveBeenCalled();
    expect((view.getByLabelText('newName') as HTMLInputElement).value).toBe('new');
    fireEvent.change(view.getByLabelText('newName'), { target: { value: 'updated' } });
    expect(store.getValue('newName')).toBe('updated');
    expect(store.getValue('oldName')).toBe('old');
  });

  it('keeps row keys attached to values across edit and move, then allocates a new key for duplication', () => {
    const schema: FormSchema = { id: 'rows', fields: [{ id: 'rows-field', name: 'rows', type: 'array', fields: [{ id: 'label-field', name: 'label', type: 'text', label: 'Label' }] }] };
    const store = new FormStore({ rows: [{ label: 'first' }, { label: 'second' }] });
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm /></FormProvider>);
    const keys = () => Array.from(view.container.querySelectorAll('[data-df-array-key]'), (node) => node.getAttribute('data-df-array-key'));
    const initial = keys();
    expect(new Set(initial).size).toBe(2);
    fireEvent.change(view.getAllByLabelText('Label')[0], { target: { value: 'edited' } });
    expect(keys()).toEqual(initial);
    fireEvent.click(view.getAllByRole('button', { name: 'Move down' })[0]);
    expect(keys()).toEqual([initial[1], initial[0]]);
    expect(store.getValue('rows')).toEqual([{ label: 'second' }, { label: 'edited' }]);
    fireEvent.click(view.getAllByRole('button', { name: 'Duplicate' })[1]);
    expect(keys().slice(0, 2)).toEqual([initial[1], initial[0]]);
    expect(new Set(keys()).size).toBe(3);
    expect(store.getValues()).toEqual({ rows: [{ label: 'second' }, { label: 'edited' }, { label: 'edited' }] });
  });

  it('keeps nested id-backed controls mounted while their binding path changes', () => {
    const mounted = vi.fn();
    const unmounted = vi.fn();
    function Control(props: FieldComponentProps) {
      useEffect(() => {
        mounted();
        return () => unmounted();
      }, []);
      return <input aria-label={props.name} value={String(props.value ?? '')} onChange={(event) => props.setValue(event.target.value)} />;
    }
    const first: FormSchema = { id: 'nested-rename', fields: [{ id: 'profile-field', name: 'profile', type: 'object', fields: [{ id: 'city-field', name: 'city', type: 'custom' }] }] };
    const renamed: FormSchema = { id: 'nested-rename', fields: [{ id: 'profile-field', name: 'profile', type: 'object', fields: [{ id: 'city-field', name: 'town', type: 'custom' }] }] };
    const store = new FormStore({ profile: { city: 'Paris', town: 'Lyon' } });
    const registry = { custom: Control };
    const view = render(<FormProvider schema={first} store={store}><HtmlForm registry={registry} /></FormProvider>);
    view.rerender(<FormProvider schema={renamed} store={store}><HtmlForm registry={registry} /></FormProvider>);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(unmounted).not.toHaveBeenCalled();
    expect((view.getByLabelText('profile.town') as HTMLInputElement).value).toBe('Lyon');
    fireEvent.change(view.getByLabelText('profile.town'), { target: { value: 'Nice' } });
    expect(store.getValue('profile.town')).toBe('Nice');
    expect(store.getValue('profile.city')).toBe('Paris');
  });

  it('resets nested values without putting row or field IDs into form data', () => {
    const schema: FormSchema = { id: 'reset', fields: [{ id: 'profile-field', name: 'profile', type: 'object', fields: [{ id: 'rows-field', name: 'rows', type: 'array', fields: [{ id: 'value-field', name: 'value', type: 'text', label: 'Value' }] }] }] };
    const store = new FormStore({ profile: { rows: [{ value: 'initial' }] } });
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm /></FormProvider>);
    const rowKey = view.container.querySelector('[data-df-array-key]')?.getAttribute('data-df-array-key');
    fireEvent.change(view.getByLabelText('Value'), { target: { value: 'edited' } });
    act(() => store.reset());
    expect((view.getByLabelText('Value') as HTMLInputElement).value).toBe('initial');
    expect(view.container.querySelector('[data-df-array-key]')?.getAttribute('data-df-array-key')).toBe(rowKey);
    expect(store.getValues()).toEqual({ profile: { rows: [{ value: 'initial' }] } });
  });
});
