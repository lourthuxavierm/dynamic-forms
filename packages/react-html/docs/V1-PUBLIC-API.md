# Native HTML v1 public API freeze

This document records the Phase 1 contract boundary for `@dynamic-form-engine/react-html` and its compatibility package `@dynamic-form-engine/html`. The current release is `1.0.0-rc.1`; the freeze describes the intended v1 surface, not a claim that stable 1.0 has been published.

## Package entry points

The supported imports are the package root, `/core`, `/controls/baseline`, `/controls/text`, `/controls/composites`, `/controls/specialized`, `/controls/temporal`, `/controls/media`, and `/styles.css`. The root is a convenience entry with the complete default registry. The control subpaths and `/core` support smaller imports and lazy loading. `/package.json` is available for package metadata.

Only exports reachable through these declared package entry points are public. Source-file imports, `dist` internals, tests, scripts, and unlisted subpaths are not supported contracts. Before stable 1.0, review generated declarations and runtime exports for each declared entry point; after release, removing or changing a public export requires the project's breaking-change policy.

## Stable renderer contract

`V1_HTML_FIELD_TYPES` and `V1HtmlFieldType` define exactly 42 stable leaf types. `object` and `array` are structural schema fields, not leaf controls and not part of that tuple. The exact inventory is protected by `v1-contract.test.tsx`; value behavior is described in [CONTROL-REFERENCE.md](./CONTROL-REFERENCE.md), and structural behavior in [structural-rendering-contracts.md](./structural-rendering-contracts.md).

`searchable-select` and `tree-checkbox` are supported compatibility extensions but are excluded from the v1 stability guarantee. They remain in `EXPERIMENTAL_HTML_FIELD_TYPES` and may not be moved into the stable tuple without an explicit versioned contract review. Core's standalone `toggle-button` is not part of this renderer's v1 inventory; `toggle-button-group` is.

The renderer owns DOM markup, native-control interaction, styling hooks, and accessible relationships. Core owns schema, values, conditions, dependencies, data sources, and validation; the React adapter owns form context and state integration. New renderer features must not create renderer-specific Core contracts.

## Compatibility package

`@dynamic-form-engine/html` forwards the canonical package's root and control entry points without its own renderer implementation. Its version must match `@dynamic-form-engine/react-html`. It remains supported throughout v1 and cannot be removed until a later major release with a migration window. New applications should import the canonical package. See [MIGRATION-FROM-HTML.md](./MIGRATION-FROM-HTML.md).

## Change control

During v1, changes to the stable type tuple, value shapes, object/array behavior, package entry points, registry override semantics, or public component props require contract tests, documentation updates, and compatibility review. Experimental controls may evolve, but must stay explicitly outside the stable inventory. Do not add new stable controls during the v1 stabilization work.

Registry controls must accept the headless `FieldComponentProps<T>` contract. Use `TypedHtmlFieldComponent<T>` or `HtmlFieldRegistration<T>` when a custom control knows its value type; heterogeneous registries keep the value type open, but reject components that require unrelated props. TypeScript checks this in `registry/type-contracts.test.ts`.

Built-in field values and configurations remain Core-owned types. Use Core's `FieldValue<T>`, `ValueFieldSchema<T>`, and `defineFormSchema()` for strict schema authoring; the renderer does not duplicate those definitions. The type contract checks numeric defaults and configuration constraints alongside registry component props.

Schema field `id` is optional design identity; `name` is the data-binding path. When an `id` is present, renderer keys prefer it so a rename can preserve the mounted control while rebinding to the new path. Array row IDs are opaque renderer identities: they follow a row through edits and reorders, while duplicated rows receive a new ID. Neither field IDs nor row IDs become form values.
