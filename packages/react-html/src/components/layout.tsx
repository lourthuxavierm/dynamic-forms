import { Children, useState, useSyncExternalStore, type CSSProperties, type ComponentType, type KeyboardEvent, type ReactNode } from 'react';
import type { FieldSchema, FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { useFormContext } from '@lourthuxavierm/dynamic-forms-react';

export type HtmlLayoutType = 'section' | 'fieldset' | 'grid' | 'stack' | 'inline' | 'card' | 'accordion' | 'tabs' | 'actions' | 'summary' | (string & {});

export interface HtmlLayoutNode {
  type: HtmlLayoutType;
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  fields?: readonly string[];
  children?: readonly HtmlLayoutNode[];
  className?: string;
  props?: Readonly<Record<string, unknown>>;
}

export interface HtmlLayoutComponentProps {
  node: HtmlLayoutNode;
  children?: ReactNode;
}

export type HtmlLayoutComponent = ComponentType<HtmlLayoutComponentProps>;
export type HtmlLayoutRegistry = Readonly<Record<string, HtmlLayoutComponent>>;
export type HtmlLayoutRegistryOverrides = Readonly<Record<string, HtmlLayoutComponent | undefined>>;

export interface HtmlTabDescriptor {
  id: string;
  label: ReactNode;
  panel: ReactNode;
}

export interface HtmlTabsRendererProps {
  tabs: readonly HtmlTabDescriptor[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  labelledBy?: string;
}

export type HtmlTabsRenderer = (props: HtmlTabsRendererProps) => ReactNode;

export function HtmlSection({ node, children }: HtmlLayoutComponentProps) {
  const headingId = node.id ? `${node.id}-heading` : undefined;
  return <section id={node.id} className={node.className} aria-labelledby={headingId}>
    {node.title ? <h2 id={headingId}>{node.title}</h2> : null}
    {node.description ? <p>{node.description}</p> : null}
    {children}
  </section>;
}

export function HtmlFieldsetLayout({ node, children }: HtmlLayoutComponentProps) {
  return <fieldset id={node.id} className={node.className} disabled={node.props?.disabled === true}>
    {node.title ? <legend>{node.title}</legend> : null}
    {node.description ? <p>{node.description}</p> : null}
    {children}
  </fieldset>;
}

export function HtmlGrid({ node, children }: HtmlLayoutComponentProps) {
  const minimum = typeof node.props?.minimumColumnWidth === 'string' ? node.props.minimumColumnWidth : '16rem';
  const style: CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minimum}), 1fr))`, gap: String(node.props?.gap ?? '1rem') };
  return <div id={node.id} className={node.className} data-df-layout="grid" style={style}>{children}</div>;
}

export function HtmlStack({ node, children }: HtmlLayoutComponentProps) {
  return <div id={node.id} className={node.className} data-df-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: String(node.props?.gap ?? '1rem') }}>{children}</div>;
}

export function HtmlInlineGroup({ node, children }: HtmlLayoutComponentProps) {
  return <div id={node.id} className={node.className} data-df-layout="inline" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: String(node.props?.gap ?? '1rem') }}>{children}</div>;
}

export function HtmlCardSection({ node, children }: HtmlLayoutComponentProps) {
  const headingId = node.id ? `${node.id}-heading` : undefined;
  return <section id={node.id} className={node.className} data-df-layout="card" aria-labelledby={headingId}>
    {node.title ? <h2 id={headingId}>{node.title}</h2> : null}
    {node.description ? <p>{node.description}</p> : null}
    {children}
  </section>;
}

export function HtmlAccordion({ node, children }: HtmlLayoutComponentProps) {
  return <details id={node.id} className={node.className} open={node.props?.defaultOpen === true || undefined}>
    <summary>{node.title ?? 'Details'}</summary>
    {node.description ? <p>{node.description}</p> : null}
    {children}
  </details>;
}

export function HtmlStickyActions({ node, children }: HtmlLayoutComponentProps) {
  return <div id={node.id} className={node.className} data-df-layout="sticky-actions" style={{ position: 'sticky', bottom: 0, zIndex: 1 }} role="group" aria-label={typeof node.title === 'string' ? node.title : 'Form actions'}>{children}</div>;
}

export function HtmlReadOnlySummary({ node }: HtmlLayoutComponentProps) {
  const { store, schema } = useFormContext();
  useSyncExternalStore(store.subscribe.bind(store), store.getState.bind(store), store.getState.bind(store));
  const fields = (node.fields ?? []).map((name) => ({ name, field: findField(schema?.fields ?? [], name), value: store.getValue(name) }));
  return <section id={node.id} className={node.className} data-df-layout="summary" aria-label={typeof node.title === 'string' ? node.title : 'Form summary'}>
    {node.title ? <h2>{node.title}</h2> : null}
    <dl>{fields.map(({ name, field, value }) => <div key={name}><dt>{field?.label ?? humanize(name)}</dt><dd>{formatSummaryValue(value)}</dd></div>)}</dl>
  </section>;
}

export function HtmlTabs({ node, children, renderer }: HtmlLayoutComponentProps & { renderer?: HtmlTabsRenderer }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const panels = Children.toArray(children);
  const tabs = panels.map((panel, index) => ({ id: `${node.id ?? 'df-tabs'}-${index}`, label: node.children?.[index]?.title ?? `Tab ${index + 1}`, panel }));
  if (renderer) return <>{renderer({ tabs, selectedIndex, onSelect: setSelectedIndex, labelledBy: node.id })}</>;
  const selectFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = event.currentTarget.closest('[dir]')?.getAttribute('dir') === 'rtl';
    const previousKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    let next = index;
    if (event.key === previousKey) next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === nextKey) next = (index + 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setSelectedIndex(next);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[next]?.focus();
  };
  return <div id={node.id} className={node.className} data-df-layout="tabs">
    <div role="tablist" aria-label={typeof node.title === 'string' ? node.title : 'Form sections'}>
      {tabs.map((tab, index) => <button key={tab.id} id={`${tab.id}-tab`} type="button" role="tab" aria-selected={selectedIndex === index} aria-controls={`${tab.id}-panel`} tabIndex={selectedIndex === index ? 0 : -1} onClick={() => setSelectedIndex(index)} onKeyDown={(event) => selectFromKeyboard(event, index)}>{tab.label}</button>)}
    </div>
    {tabs.map((tab, index) => <div key={tab.id} id={`${tab.id}-panel`} role="tabpanel" aria-labelledby={`${tab.id}-tab`} hidden={selectedIndex !== index}>{tab.panel}</div>)}
  </div>;
}

const DEFAULT_LAYOUT_REGISTRY: HtmlLayoutRegistry = Object.freeze({
  section: HtmlSection,
  fieldset: HtmlFieldsetLayout,
  grid: HtmlGrid,
  stack: HtmlStack,
  inline: HtmlInlineGroup,
  card: HtmlCardSection,
  accordion: HtmlAccordion,
  actions: HtmlStickyActions,
  summary: HtmlReadOnlySummary,
});

export function createHtmlLayoutRegistry(overrides: HtmlLayoutRegistryOverrides = {}): HtmlLayoutRegistry {
  const result: Record<string, HtmlLayoutComponent> = { ...DEFAULT_LAYOUT_REGISTRY };
  for (const [type, component] of Object.entries(overrides)) {
    if (component) result[type] = component;
    else delete result[type];
  }
  return Object.freeze(result);
}

function findField(fields: readonly FieldSchema[], path: string): FieldSchema | undefined {
  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter((segment) => !/^\d+$/.test(segment));
  let candidates = fields;
  let result: FieldSchema | undefined;
  for (const segment of segments) {
    result = candidates.find((field) => field.name === segment);
    if (!result) return undefined;
    candidates = result.fields ?? [];
  }
  return result;
}

function formatSummaryValue(value: unknown): ReactNode {
  if (value == null || value === '') return 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ') : 'None';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function humanize(value: string): string {
  const leaf = value.split('.').at(-1) ?? value;
  return leaf.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
