import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Badge, Button, PanelHeader, Switch, Tabs } from './Primitives';

describe('design-system primitives', () => {
  it('renders button variants with a safe default type', () => {
    const html = renderToStaticMarkup(<Button variant="primary">Save</Button>);
    expect(html).toContain('type="button"');
    expect(html).toContain('ui-button--primary');
  });

  it('exposes tab state and accessible labels', () => {
    const html = renderToStaticMarkup(<Tabs items={['design', 'preview'] as const} value="design" onChange={() => undefined} ariaLabel="Builder view" />);
    expect(html).toContain('aria-label="Builder view"');
    expect(html).toContain('aria-current="page"');
  });

  it('renders semantic status, switch, and panel content', () => {
    expect(renderToStaticMarkup(<Badge tone="danger">1 issue</Badge>)).toContain('ui-badge--danger');
    expect(renderToStaticMarkup(<Switch label="Required" checked readOnly />)).toContain('type="checkbox"');
    expect(renderToStaticMarkup(<PanelHeader title="Fields" description="Add fields" />)).toContain('<h2>Fields</h2>');
  });
});

