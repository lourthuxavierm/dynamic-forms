# React HTML layouts

- Status: Implemented
- Owner: React HTML maintainers
- Last verified: 2026-08-27
- Applies to: `@lourthuxavierm/dynamic-forms-react-html` 0.1.0

`HtmlForm.layout` accepts declarative nodes for sections, fieldsets, grids,
stacks, inline groups, cards, accordions, tabs, actions, and summaries. Fields
not referenced by the layout are rendered afterward, preventing accidental
loss. Layout nodes arrange fields without changing stored values.

Applications can extend `layoutRegistry`, replace tabs with `tabsRenderer`, and
virtualize large arrays through `arrayItemsRenderer`. See the
[deep-reference catalogue](./deep-references.md) for the package-local native
layout and structural contracts.
