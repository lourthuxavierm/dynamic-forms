import { Fragment, type ReactNode } from 'react';
import type { FieldSchema } from '@lourthuxavierm/dynamic-forms-core';
import type { HtmlLayoutNode, HtmlLayoutRegistry, HtmlTabsRenderer } from '../components/layout';
import { HtmlTabs } from '../components/layout';

export interface HtmlLayoutRendererProps {
  layout: readonly HtmlLayoutNode[];
  fields: readonly FieldSchema[];
  registry: HtmlLayoutRegistry;
  renderField: (field: FieldSchema) => ReactNode;
  submitAction: ReactNode;
  tabsRenderer?: HtmlTabsRenderer;
}

export interface HtmlLayoutRenderResult {
  content: ReactNode;
  referencedFields: ReadonlySet<string>;
  rendersActions: boolean;
}

export function renderHtmlLayout({ layout, fields, registry, renderField, submitAction, tabsRenderer }: HtmlLayoutRendererProps): HtmlLayoutRenderResult {
  const fieldMap = new Map(fields.map((field) => [field.name, field]));
  const referenced = new Set<string>();
  let rendersActions = false;

  const renderNode = (node: HtmlLayoutNode, key: string): ReactNode => {
    const fieldContent = (node.fields ?? []).map((name) => {
      if (node.type === 'summary') return null;
      const field = fieldMap.get(name);
      if (!field) throw new Error(`HTML layout references unknown top-level field "${name}".`);
      if (referenced.has(name)) throw new Error(`HTML layout references field "${name}" more than once.`);
      referenced.add(name);
      return <Fragment key={name}>{renderField(field)}</Fragment>;
    });
    const childContent = node.children?.map((child, index) => renderNode(child, `${key}-${index}`));
    const content = <>{fieldContent}{childContent}</>;
    if (node.type === 'actions') rendersActions = true;
    if (node.type === 'tabs') return <HtmlTabs key={key} node={node} renderer={tabsRenderer}>{childContent}</HtmlTabs>;
    const Component = registry[node.type];
    if (!Component) throw new Error(`No HTML layout registered for type "${node.type}".`);
    return <Component key={key} node={node}>{node.type === 'actions' ? submitAction : content}</Component>;
  };

  return { content: layout.map((node, index) => renderNode(node, `layout-${index}`)), referencedFields: referenced, rendersActions };
}
