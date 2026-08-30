# Migrating from `@dynamic-form-engine/html`

`@dynamic-form-engine/react-html` is the canonical React native-HTML renderer. The legacy package currently forwards every public entry, so migration changes module specifiers only; schemas, values, registries, components, and CSS class hooks remain unchanged.

## Replace the dependency

```sh
pnpm remove @dynamic-form-engine/html
pnpm add @dynamic-form-engine/react-html
```

## Replace imports

| Legacy import | Canonical import |
| --- | --- |
| `@dynamic-form-engine/html` | `@dynamic-form-engine/react-html` |
| `@dynamic-form-engine/html/core` | `@dynamic-form-engine/react-html/core` |
| `@dynamic-form-engine/html/controls/baseline` | `@dynamic-form-engine/react-html/controls/baseline` |
| `@dynamic-form-engine/html/controls/text` | `@dynamic-form-engine/react-html/controls/text` |
| `@dynamic-form-engine/html/controls/composites` | `@dynamic-form-engine/react-html/controls/composites` |
| `@dynamic-form-engine/html/controls/specialized` | `@dynamic-form-engine/react-html/controls/specialized` |
| `@dynamic-form-engine/html/controls/temporal` | `@dynamic-form-engine/react-html/controls/temporal` |
| `@dynamic-form-engine/html/controls/media` | `@dynamic-form-engine/react-html/controls/media` |
| `@dynamic-form-engine/html/styles.css` | `@dynamic-form-engine/react-html/styles.css` |

Run typechecking, tests, and the production build after replacement. No form-schema migration or submitted-value transformation is required.

## Compatibility lifecycle

The forwarding package remains supported throughout the v1 line. It may be removed only in a later major release after advance release notes and a migration window. New code must use the canonical package directly.
