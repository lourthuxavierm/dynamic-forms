/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormProvider } from '@lourthuxavierm/dynamic-forms-react';
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
