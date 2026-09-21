/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HtmlArrayRenderItem } from './index';
import { HtmlForm } from './index';

afterEach(cleanup);

function setup(schema: FormSchema, values: Record<string, unknown>, arrayItemsRenderer?: React.ComponentProps<typeof HtmlForm>['arrayItemsRenderer']) {
  const store = new FormStore(values);
  const view = render(<FormProvider schema={schema} store={store}><HtmlForm arrayItemsRenderer={arrayItemsRenderer} /></FormProvider>);
  return { store, view };
}

describe('Phase 9 structural rendering', () => {
  it('renders nested objects and indexed arrays of objects', () => {
    const schema: FormSchema = { id: 'nested', fields: [{ name: 'profile', type: 'object', label: 'Profile', fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'addresses', type: 'array', label: 'Addresses', fields: [{ name: 'city', type: 'text', label: 'City' }] },
    ] }] };
    const { view } = setup(schema, { profile: { name: 'Ada', addresses: [{ city: 'London' }, { city: 'Paris' }] } });
    expect((view.getByLabelText('Name') as HTMLInputElement).value).toBe('Ada');
    expect(view.getAllByLabelText('City').map((node) => (node as HTMLInputElement).value)).toEqual(['London', 'Paris']);
    expect(view.getAllByLabelText('City').map((node) => node.getAttribute('name'))).toEqual(['profile.addresses[0].city', 'profile.addresses[1].city']);
  });

  it('supports primitive arrays and preserves stable keys through edit and reorder', () => {
    const schema: FormSchema = { id: 'primitive', fields: [{ name: 'tags', type: 'array', label: 'Tags', metadata: { primitiveItems: true }, fields: [{ name: '$value', type: 'text', label: 'Tag' }] }] };
    const { store, view } = setup(schema, { tags: ['one', 'two'] });
    const before = Array.from(view.container.querySelectorAll('[data-df-array-key]')).map((node) => node.getAttribute('data-df-array-key'));
    fireEvent.change(view.getAllByLabelText('Tag')[0], { target: { value: 'first' } });
    const afterEdit = Array.from(view.container.querySelectorAll('[data-df-array-key]')).map((node) => node.getAttribute('data-df-array-key'));
    expect(afterEdit).toEqual(before);
    fireEvent.click(view.getAllByRole('button', { name: 'Move down' })[0]);
    const afterMove = Array.from(view.container.querySelectorAll('[data-df-array-key]')).map((node) => node.getAttribute('data-df-array-key'));
    expect(afterMove).toEqual([before[1], before[0]]);
    expect(store.getValue('tags')).toEqual(['two', 'first']);
  });

  it('supports add, duplicate, remove and enforces item constraints', () => {
    const schema: FormSchema = { id: 'operations', fields: [{ name: 'people', type: 'array', label: 'People', validation: { minItems: 1, maxItems: 3 }, fields: [{ name: 'name', type: 'text', defaultValue: 'New', label: 'Person name' }] }] };
    const { store, view } = setup(schema, { people: [{ name: 'Ada' }] });
    expect((view.getByRole('button', { name: 'Remove' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(view.getByRole('button', { name: 'Duplicate' }));
    expect(store.getValue('people')).toEqual([{ name: 'Ada' }, { name: 'Ada' }]);
    fireEvent.click(view.getByRole('button', { name: 'Add item' }));
    expect(store.getValue('people')).toEqual([{ name: 'Ada' }, { name: 'Ada' }, { name: 'New' }]);
    expect((view.getByRole('button', { name: 'Add item' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('builds deep defaults for array objects and keeps nested paths correct through reorder and removal', () => {
    const schema: FormSchema = { id: 'deep-operations', fields: [{ name: 'groups', type: 'array', label: 'Groups', fields: [
      { name: 'name', type: 'text', label: 'Group name', defaultValue: 'New' },
      { name: 'settings', type: 'object', label: 'Settings', fields: [
        { name: 'enabled', type: 'checkbox', label: 'Enabled', defaultValue: true },
        { name: 'details', type: 'object', label: 'Details', fields: [{ name: 'title', type: 'text', label: 'Title', defaultValue: 'Draft' }] },
      ] },
      { name: 'tags', type: 'array', label: 'Tags', fields: [{ name: '$value', type: 'text', label: 'Tag' }] },
    ] }] };
    const { store, view } = setup(schema, { groups: [{ name: 'Existing', settings: { enabled: false, details: { title: 'Saved' } }, tags: ['old'] }] });
    const outer = view.container.querySelector('[data-df-field="groups"]')!;
    const rows = () => Array.from(outer.querySelectorAll(':scope > div > div > fieldset.df-array-item'));
    const keys = () => rows().map((node) => node.getAttribute('data-df-array-key'));
    const originalKey = keys()[0];
    fireEvent.click(outer.querySelector(':scope > button')!);
    expect(store.getValue('groups')).toEqual([
      { name: 'Existing', settings: { enabled: false, details: { title: 'Saved' } }, tags: ['old'] },
      { name: 'New', settings: { enabled: true, details: { title: 'Draft' } }, tags: [] },
    ]);
    expect((view.getAllByLabelText('Title')[1] as HTMLInputElement).name).toBe('groups[1].settings.details.title');
    const addedKey = keys()[1];
    fireEvent.click(rows()[1].querySelector(':scope > div[role="group"] > button:nth-child(3)')!);
    expect(keys()).toEqual([addedKey, originalKey]);
    expect(store.getValue('groups')).toEqual([
      { name: 'New', settings: { enabled: true, details: { title: 'Draft' } }, tags: [] },
      { name: 'Existing', settings: { enabled: false, details: { title: 'Saved' } }, tags: ['old'] },
    ]);
    fireEvent.click(rows()[1].querySelector(':scope > div[role="group"] > button:first-child')!);
    expect(keys()).toEqual([addedKey]);
    expect(store.getValue('groups')).toEqual([{ name: 'New', settings: { enabled: true, details: { title: 'Draft' } }, tags: [] }]);
  });

  it('honors array duplicate and reorder restrictions without disabling add or remove', () => {
    const schema: FormSchema = { id: 'restricted-operations', fields: [{ name: 'items', type: 'array', config: { allowDuplicate: false, allowReorder: false }, fields: [{ name: 'value', type: 'text', label: 'Value' }] }] };
    const { store, view } = setup(schema, { items: [{ value: 'one' }, { value: 'two' }] });
    expect(view.getAllByRole('button', { name: 'Duplicate' }).every((node) => (node as HTMLButtonElement).disabled)).toBe(true);
    expect(view.getAllByRole('button', { name: 'Move up' }).every((node) => (node as HTMLButtonElement).disabled)).toBe(true);
    expect(view.getAllByRole('button', { name: 'Move down' }).every((node) => (node as HTMLButtonElement).disabled)).toBe(true);
    fireEvent.click(view.getAllByRole('button', { name: 'Remove' })[0]);
    expect(store.getValue('items')).toEqual([{ value: 'two' }]);
    fireEvent.click(view.getByRole('button', { name: 'Add item' }));
    expect(store.getValue('items')).toEqual([{ value: 'two' }, { value: '' }]);
  });

  it('shows deep nested errors at their indexed field path', () => {
    const schema: FormSchema = { id: 'deep-errors', fields: [{ name: 'rows', type: 'array', fields: [{ name: 'details', type: 'object', fields: [{ name: 'title', type: 'text', label: 'Title' }] }] }] };
    const { store, view } = setup(schema, { rows: [{ details: { title: '' } }] });
    act(() => store.setError('rows[0].details.title', 'Title is required'));
    const input = view.getByLabelText('Title') as HTMLInputElement;
    expect(input.name).toBe('rows[0].details.title');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(view.getAllByText('Title is required')).toHaveLength(2);
  });

  it('evaluates sibling conditions inside items and exposes a windowed renderer contract', () => {
    const windowed = vi.fn(({ items }: { items: readonly HtmlArrayRenderItem[] }) => <>{items.slice(0, 1).map((item) => <div key={item.id}>{item.content}</div>)}</>);
    const schema: FormSchema = { id: 'conditional', fields: [{ name: 'contacts', type: 'array', label: 'Contacts', fields: [
      { name: 'kind', type: 'text', label: 'Kind' },
      { name: 'company', type: 'text', label: 'Company', visibleWhen: { field: 'kind', operator: 'equals', value: 'business' } },
    ] }] };
    const { view } = setup(schema, { contacts: [{ kind: 'business', company: 'ACME' }, { kind: 'personal', company: '' }] }, windowed);
    expect(view.getAllByLabelText('Company')).toHaveLength(1);
    expect(windowed).toHaveBeenCalled();
    expect(windowed.mock.calls[0][0].items).toHaveLength(2);
  });

  it('renders collection and indexed item errors', () => {
    const schema: FormSchema = { id: 'errors', fields: [{ name: 'rows', type: 'array', label: 'Rows', fields: [{ name: 'value', type: 'text', label: 'Value' }] }] };
    const { store, view } = setup(schema, { rows: [{ value: '' }] });
    act(() => {
      store.setError('rows', 'Add another row');
      store.setError('rows[0].value', 'Value is required');
    });
    expect(view.getAllByText('Add another row').length).toBeGreaterThan(0);
    expect(view.getAllByText('Value is required').length).toBeGreaterThan(0);
  });
});
