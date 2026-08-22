# Native layout system

The HTML adapter owns layout composition. Core schemas remain portable and contain no HTML-specific layout properties.

Pass a declarative `layout` tree to `HtmlForm`. Nodes reference top-level schema fields by name and can use the built-in `section`, `fieldset`, `grid`, `stack`, `inline`, `card`, `accordion`, `tabs`, `actions`, and `summary` types.

```tsx
<HtmlForm layout={[
  { type: 'section', id: 'identity', title: 'Identity', children: [
    { type: 'grid', fields: ['firstName', 'lastName'] },
  ] },
  { type: 'accordion', title: 'Optional details', fields: ['notes'] },
  { type: 'actions' },
]} />
```

Fields omitted from the tree render after the configured layout so configuration changes cannot silently drop controls. Unknown or duplicate field references fail with actionable errors.

## Extension contracts

Use `layoutRegistry` to register or replace layout components for one form. Custom components receive the immutable node and its rendered children.

Use `tabsRenderer` to integrate an application tab system. It receives ordered tab descriptors, the selected index, and an `onSelect` callback. The built-in fallback uses `tablist`, `tab`, and `tabpanel` semantics.

The `summary` node reads current store values and renders a semantic description list. It is display-only and does not copy values into adapter state.
