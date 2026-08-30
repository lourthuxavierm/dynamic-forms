/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { FormStore, type FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormProvider } from '@lourthuxavierm/dynamic-forms-react';
import { afterEach, describe, expect, it } from 'vitest';
import { HtmlForm, createDefaultHtmlRegistry } from './index';

afterEach(cleanup);

function renderField(field: FormSchema['fields'][number], value: unknown) {
  const schema: FormSchema = { id: 'composite', fields: [field] };
  const store = new FormStore({ [field.name]: value });
  const view = render(<FormProvider store={store} schema={schema}><HtmlForm /></FormProvider>);
  return { store, view };
}

describe('Phase 5 composite controls', () => {
  it('registers every composite control', () => {
    const registry = createDefaultHtmlRegistry();
    for (const type of ['checkbox-group', 'radio-group', 'switch', 'autocomplete', 'async-autocomplete', 'searchable-select', 'tree-select', 'tree-checkbox', 'toggle-button-group']) {
      expect(registry[type]).toBeDefined();
    }
  });

  it('updates checkbox groups, radio groups, and switches with native semantics', () => {
    let result = renderField({ name: 'roles', type: 'checkbox-group', label: 'Roles', options: [{ label: 'Admin', value: 'admin' }] }, []);
    fireEvent.click(result.view.getByRole('checkbox', { name: 'Admin' }));
    expect(result.store.getValue('roles')).toEqual(['admin']);
    result.view.unmount();

    result = renderField({ name: 'choice', type: 'radio-group', label: 'Choice', options: [{ label: 'One', value: 1 }] }, undefined);
    fireEvent.click(result.view.getByRole('radio', { name: 'One' }));
    expect(result.store.getValue('choice')).toBe(1);
    result.view.unmount();

    result = renderField({ name: 'enabled', type: 'switch', label: 'Enabled' }, false);
    fireEvent.click(result.view.getByRole('switch', { name: 'Enabled' }));
    expect(result.store.getValue('enabled')).toBe(true);
  });

  it('supports the documented combobox keyboard contract', () => {
    const { store, view } = renderField({
      name: 'fruit', type: 'autocomplete', label: 'Fruit',
      options: [{ label: 'Apple', value: 'apple' }, { label: 'Banana', value: 'banana' }],
    }, undefined);
    const input = view.getByRole('combobox', { name: 'Fruit' });
    fireEvent.focus(input);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    fireEvent.change(input, { target: { value: 'ban' } });
    fireEvent.keyDown(input, { key: 'End' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(store.getValue('fruit')).toBe('banana');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('loads and selects async autocomplete options', async () => {
    const field = {
      name: 'country', type: 'async-autocomplete', label: 'Country',
      dataSource: { type: 'static' as const, options: [{ label: 'India', value: 'IN' }] },
    };
    const { store, view } = renderField(field, undefined);
    const input = view.getByRole('combobox', { name: 'Country' });
    fireEvent.focus(input);
    await waitFor(() => expect(view.getByRole('option', { name: 'India' })).toBeTruthy());
    fireEvent.click(view.getByRole('option', { name: 'India' }));
    expect(store.getValue('country')).toBe('IN');
  });

  it('preserves typed values in tree selection and nested tree checkboxes', () => {
    const options = [{ label: 'Parent', value: 1, children: [{ label: 'Child', value: 2 }] }];
    let result = renderField({ name: 'node', type: 'tree-select', label: 'Node', options }, undefined);
    fireEvent.change(result.view.getByRole('combobox', { name: 'Node' }), { target: { value: '1' } });
    expect(result.store.getValue('node')).toBe(2);
    result.view.unmount();

    result = renderField({ name: 'nodes', type: 'tree-checkbox', label: 'Nodes', options }, []);
    fireEvent.click(result.view.getByRole('checkbox', { name: 'Child' }));
    expect(result.store.getValue('nodes')).toEqual([2]);
  });

  it('implements single and multiple toggle-button selection', () => {
    const options = [{ label: 'List', value: 'list' }, { label: 'Grid', value: 'grid' }];
    let result = renderField({ name: 'view', type: 'toggle-button-group', label: 'View', options }, 'list');
    fireEvent.click(result.view.getByRole('button', { name: 'Grid' }));
    expect(result.store.getValue('view')).toBe('grid');
    expect(result.view.getByRole('button', { name: 'Grid' }).getAttribute('aria-pressed')).toBe('true');
    result.view.unmount();

    result = renderField({ name: 'views', type: 'toggle-button-group', label: 'Views', options, config: { multiple: true } }, []);
    fireEvent.click(result.view.getByRole('button', { name: 'List' }));
    expect(result.store.getValue('views')).toEqual(['list']);
  });
});
