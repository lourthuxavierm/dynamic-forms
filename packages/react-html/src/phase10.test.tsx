/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HtmlForm, type HtmlLayoutComponentProps, type HtmlLayoutNode, type HtmlTabsRendererProps } from './index';

afterEach(cleanup);

const schema: FormSchema = { id: 'layout', fields: [
  { name: 'firstName', type: 'text', label: 'First name' },
  { name: 'lastName', type: 'text', label: 'Last name' },
  { name: 'notes', type: 'textarea', label: 'Notes' },
] };

function setup(layout: readonly HtmlLayoutNode[], options: Partial<React.ComponentProps<typeof HtmlForm>> = {}) {
  const store = new FormStore({ firstName: 'Ada', lastName: 'Lovelace', notes: 'Analyst' });
  const view = render(<FormProvider schema={schema} store={store}><HtmlForm layout={layout} {...options} /></FormProvider>);
  return { store, view };
}

describe('Phase 10 native layout system', () => {
  it('renders semantic sections, fieldsets, responsive grids, stacks, inline groups and cards', () => {
    const layout: HtmlLayoutNode[] = [{ type: 'section', id: 'identity', title: 'Identity', children: [
      { type: 'fieldset', title: 'Names', children: [{ type: 'grid', fields: ['firstName'], props: { minimumColumnWidth: '12rem' } }] },
      { type: 'card', id: 'details', title: 'Details', children: [{ type: 'stack', children: [{ type: 'inline', fields: ['lastName'] }] }] },
    ] }];
    const { view } = setup(layout);
    expect(view.getByRole('region', { name: 'Identity' })).toBeTruthy();
    expect(view.getByRole('group', { name: 'Names' })).toBeTruthy();
    const grid = view.container.querySelector('[data-df-layout="grid"]') as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain('auto-fit');
    expect(view.container.querySelector('[data-df-layout="stack"]')).toBeTruthy();
    expect(view.container.querySelector('[data-df-layout="inline"]')).toBeTruthy();
    expect(view.container.querySelector('[data-df-layout="card"]')).toBeTruthy();
    expect(view.getByLabelText('Notes')).toBeTruthy();
  });

  it('renders native accordions and places submit in a sticky action bar', () => {
    const { view } = setup([{ type: 'accordion', title: 'Optional', fields: ['notes'], props: { defaultOpen: false } }, { type: 'actions', title: 'Save actions' }]);
    const details = view.getByText('Optional').closest('details')!;
    expect(details.open).toBe(false);
    const actions = view.getByRole('group', { name: 'Save actions' });
    expect(actions.getAttribute('data-df-layout')).toBe('sticky-actions');
    expect(actions.querySelector('button[type="submit"]')).toBeTruthy();
    expect(view.container.querySelectorAll('button[type="submit"]')).toHaveLength(1);
  });

  it('provides accessible built-in tabs and a replaceable tabs renderer', () => {
    let result = setup([{ type: 'tabs', id: 'profile-tabs', title: 'Profile', children: [
      { type: 'section', title: 'Names', fields: ['firstName'] },
      { type: 'section', title: 'Details', fields: ['notes'] },
    ] }]);
    expect(result.view.getByRole('tab', { name: 'Names' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(result.view.getByRole('tab', { name: 'Details' }));
    expect(result.view.getByRole('tab', { name: 'Details' }).getAttribute('aria-selected')).toBe('true');
    result.view.unmount();

    const tabsRenderer = vi.fn(({ tabs }: HtmlTabsRendererProps) => <nav aria-label="Custom tabs">{tabs.map((tab) => <span key={tab.id}>{tab.label}</span>)}</nav>);
    result = setup([{ type: 'tabs', children: [{ type: 'section', title: 'Names', fields: ['firstName'] }] }], { tabsRenderer });
    expect(result.view.getByRole('navigation', { name: 'Custom tabs' })).toBeTruthy();
    expect(tabsRenderer).toHaveBeenCalled();
  });

  it('renders a read-only summary from live store values', () => {
    const { store, view } = setup([{ type: 'summary', title: 'Review', fields: ['firstName', 'lastName'] }]);
    expect(view.getByRole('region', { name: 'Review' }).textContent).toContain('Ada');
    fireEvent.change(view.getByLabelText('First name'), { target: { value: 'Grace' } });
    expect(store.getValue('firstName')).toBe('Grace');
    expect(view.getByRole('region', { name: 'Review' }).textContent).toContain('Grace');
  });

  it('supports custom layout registration and rejects invalid field references', () => {
    const Custom = ({ node, children }: HtmlLayoutComponentProps) => <aside aria-label={String(node.title)}>{children}</aside>;
    const { view } = setup([{ type: 'custom', title: 'Custom area', fields: ['firstName'] }], { layoutRegistry: { custom: Custom } });
    expect(view.getByRole('complementary', { name: 'Custom area' })).toBeTruthy();
    view.unmount();
    expect(() => setup([{ type: 'section', fields: ['missing'] }])).toThrow(/unknown top-level field/);
    expect(() => setup([{ type: 'section', fields: ['firstName', 'firstName'] }])).toThrow(/more than once/);
  });
});
