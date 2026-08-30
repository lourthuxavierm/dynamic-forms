# @dynamic-form-engine/react-html

The HTML package renders Dynamic Forms schemas with accessible browser-native controls. It depends on Core and React, has no third-party component-library runtime, and ships optional static CSS.

## Install

```sh
pnpm add @dynamic-form-engine/core @dynamic-form-engine/react @dynamic-form-engine/react-html react react-dom
```

Import `@dynamic-form-engine/react-html/styles.css` once if you want the default styling layer.

## Capabilities

- Native baseline, text, selection, temporal, specialized, composite, and media controls
- Object and array structural rendering
- Sections, fieldsets, grids, stacks, tabs, accordions, actions, and summaries
- Registry overrides and lazy control groups
- Accessible labels, descriptions, errors, keyboard interaction, and focus handling

The package-local `packages/react-html/README.md` and `packages/react-html/docs/VERSION-1.md` files contain the detailed API and behavior inventory.

## Legacy package name

`@dynamic-form-engine/html` remains available as a thin compatibility package. It forwards the same root API, control subpaths, and stylesheet to `@dynamic-form-engine/react-html`. New applications should use the canonical package name directly.
