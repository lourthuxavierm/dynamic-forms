/** @vitest-environment happy-dom */
import axe from 'axe-core';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HtmlForm, type HtmlLayoutNode } from './index';

afterEach(cleanup);

const schema: FormSchema = { id: 'a11y', fields: [
  { name: 'name', type: 'text', label: 'Name', description: 'Use your full name', validation: { required: true } },
  { name: 'role', type: 'autocomplete', label: 'Role', validation: { required: true }, options: [
    { label: 'Unavailable', value: 'none', disabled: true },
    { label: 'Engineer', value: 'engineer' },
  ] },
  { name: 'updates', type: 'checkbox-group', label: 'Updates', description: 'Choose notification channels', options: [{ label: 'Email', value: 'email' }] },
  { name: 'reference', type: 'text', label: 'Reference', readOnly: true },
] };

function setup(options: { values?: Record<string, unknown>; layout?: readonly HtmlLayoutNode[]; dir?: 'ltr' | 'rtl' } = {}) {
  const store = new FormStore(options.values ?? { name: '', role: undefined, updates: [], reference: 'R-1' });
  const view = render(<FormProvider store={store} schema={schema}><HtmlForm layout={options.layout} dir={options.dir} /></FormProvider>);
  return { store, view };
}

describe('Phase 12 accessibility hardening', () => {
  it('passes automated axe checks for representative native controls', async () => {
    const { view } = setup();
    const result = await axe.run(view.container, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
  });

  it('announces errors, renders a linked summary, and focuses the first invalid field', async () => {
    const { view } = setup();
    fireEvent.click(view.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(view.getByRole('alert', { name: 'Please correct the following errors' })).toBeTruthy());
    const name = view.getByRole('textbox', { name: /Name/ });
    expect(document.activeElement).toBe(name);
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(name.getAttribute('aria-describedby')).toContain('description');
    expect(name.getAttribute('aria-describedby')).toContain('error');
    expect(view.getByRole('link', { name: /Name is required/ }).getAttribute('href')).toBe(`#${name.id}`);
  });

  it('preserves logical DOM focus order and distinct disabled/read-only semantics', () => {
    const { view, store } = setup();
    const focusable = Array.from(view.container.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
    expect(focusable.map((element) => element.getAttribute('name') ?? element.textContent)).toEqual(['name', 'role', 'updates', 'reference', 'Submit']);
    const readOnly = view.getByRole('textbox', { name: 'Reference' }) as HTMLInputElement;
    expect(readOnly.readOnly).toBe(true);
    expect(readOnly.disabled).toBe(false);
    fireEvent.change(readOnly, { target: { value: 'changed' } });
    expect(store.getValue('reference')).toBe('R-1');
  });

  it('links descriptions and required state and groups options with fieldset and legend', () => {
    const { view } = setup();
    const name = view.getByRole('textbox', { name: /Name/ });
    expect(name.getAttribute('aria-required')).toBe('true');
    expect(view.getByText('Use your full name').id).toBe(name.getAttribute('aria-describedby'));
    const group = view.getByRole('group', { name: 'Updates' });
    expect(group.tagName).toBe('FIELDSET');
    expect(group.getAttribute('aria-describedby')).toBe(view.getByText('Choose notification channels').id);
  });

  it('implements combobox first/last navigation, disabled-option skipping, selection and escape', () => {
    const { view, store } = setup();
    const combo = view.getByRole('combobox', { name: /Role/ });
    fireEvent.focus(combo);
    fireEvent.keyDown(combo, { key: 'ArrowDown' });
    expect(combo.getAttribute('aria-activedescendant')).toContain('option-1');
    fireEvent.keyDown(combo, { key: 'Enter' });
    expect(store.getValue('role')).toBe('engineer');
    fireEvent.focus(combo);
    fireEvent.change(combo, { target: { value: '' } });
    fireEvent.keyDown(combo, { key: 'Home' });
    expect(combo.getAttribute('aria-activedescendant')).toContain('option-1');
    fireEvent.keyDown(combo, { key: 'Escape' });
    expect(combo.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports RTL-aware tab navigation and keeps focus on the selected tab', () => {
    const layout: HtmlLayoutNode[] = [{ type: 'tabs', title: 'Profile', children: [
      { type: 'section', title: 'Identity', fields: ['name'] },
      { type: 'section', title: 'Preferences', fields: ['updates'] },
    ] }];
    const { view } = setup({ layout, dir: 'rtl' });
    const identity = view.getByRole('tab', { name: 'Identity' });
    identity.focus();
    fireEvent.keyDown(identity, { key: 'ArrowLeft' });
    const preferences = view.getByRole('tab', { name: 'Preferences' });
    expect(preferences.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(preferences);
    fireEvent.keyDown(preferences, { key: 'Home' });
    expect(document.activeElement).toBe(identity);
  });
});
