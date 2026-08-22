/** @vitest-environment happy-dom */
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { FormStore, createFormValidator, type FormSchema } from '@dynamic-forms/core';
import { describe, expect, it } from 'vitest';
import { FormProvider, useFieldArray, useSection, useWizard } from './index';

describe('Phase 1 headless contracts', () => {
  it('keeps array identities stable while moving immutable values', () => {
    const store = new FormStore({ contacts: [{ name: 'A' }, { name: 'B' }] });
    const wrapper = ({ children }: { children: ReactNode }) => createElement(FormProvider, { store, children });
    const { result } = renderHook(() => useFieldArray<{ name: string }>('contacts'), { wrapper });
    const firstId = result.current.fields[0].id;
    act(() => result.current.move(0, 1));
    expect(result.current.fields[1].id).toBe(firstId);
    expect(store.getValue('contacts')).toEqual([{ name: 'B' }, { name: 'A' }]);
    expect(Object.isFrozen(store.getValue('contacts'))).toBe(true);
  });

  it('enforces conditional required rules and ignores hidden fields', async () => {
    const schema: FormSchema = { id: 'conditional', fields: [
      { name: 'enabled', type: 'checkbox' },
      { name: 'detail', type: 'text', requiredWhen: { field: 'enabled', operator: 'equals', value: true } },
      { name: 'hidden', type: 'text', validation: { required: true }, visibleWhen: { field: 'enabled', operator: 'equals', value: false } },
    ] };
    expect(await createFormValidator(schema)({ enabled: true, detail: '', hidden: '' })).toEqual({ detail: 'detail is required' });
  });

  it('provides adapter-neutral section and wizard state', () => {
    const section = renderHook(() => useSection('details'));
    act(() => section.result.current.collapse());
    expect(section.result.current.expanded).toBe(false);
    const wizard = renderHook(() => useWizard([{ id: 'one' }, { id: 'skip', disabled: true }, { id: 'three' }]));
    act(() => wizard.result.current.next());
    expect(wizard.result.current.activeStep?.id).toBe('three');
  });
});
