# Schema and layouts

- Status: Boundary documented
- Owner: Core and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: Core and React HTML 0.1.0

## Current boundary

`FormSchema` has no layout property. Core owns fields and behavior; React HTML
accepts a separate `HtmlLayoutNode[]` through `HtmlForm.layout`.

```text
FormSchema fields + renderer layout tree -> React HTML rendering
```

Do not add renderer components or `HtmlLayoutNode` objects to transported Core
schemas unless your application defines and validates that composition format.

## React HTML layout example

```tsx verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormProvider } from '@lourthuxavierm/dynamic-forms-react';
import { HtmlForm, type HtmlLayoutNode } from '@lourthuxavierm/dynamic-forms-react-html';

const schema: FormSchema = {
  id: 'layout-example',
  fields: [
    { name: 'firstName', type: 'text' },
    { name: 'lastName', type: 'text' },
  ],
};

const layout: readonly HtmlLayoutNode[] = [
  { type: 'grid', fields: ['firstName', 'lastName'], props: { minimumColumnWidth: '14rem' } },
  { type: 'actions' },
];

export function LayoutExample() {
  return <FormProvider schema={schema}><HtmlForm schema={schema} layout={layout} /></FormProvider>;
}
```

React HTML provides section, fieldset, grid, stack, inline, card, accordion,
tabs, actions, and summary layouts. Custom layout nodes belong to the renderer's
layout registry and are not automatically portable to future renderers.

## Portability rule

Keep semantic field grouping in object/array schemas and visual arrangement in
renderer layout contracts. A future shared layout schema requires a separate
approved Core design; documentation must not imply one exists today.
