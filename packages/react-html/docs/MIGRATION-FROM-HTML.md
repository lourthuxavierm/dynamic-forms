# Migrating from `@dynamic-forms/html`

`@dynamic-forms/react-html` is the canonical React native-HTML renderer. The legacy package currently forwards every public entry, so migration changes module specifiers only; schemas, values, registries, components, and CSS class hooks remain unchanged.

## Replace the dependency

```sh
pnpm remove @dynamic-forms/html
pnpm add @dynamic-forms/react-html
```

## Replace imports

| Legacy import | Canonical import |
| --- | --- |
| `@dynamic-forms/html` | `@dynamic-forms/react-html` |
| `@dynamic-forms/html/core` | `@dynamic-forms/react-html/core` |
| `@dynamic-forms/html/controls/baseline` | `@dynamic-forms/react-html/controls/baseline` |
| `@dynamic-forms/html/controls/text` | `@dynamic-forms/react-html/controls/text` |
| `@dynamic-forms/html/controls/composites` | `@dynamic-forms/react-html/controls/composites` |
| `@dynamic-forms/html/controls/specialized` | `@dynamic-forms/react-html/controls/specialized` |
| `@dynamic-forms/html/controls/temporal` | `@dynamic-forms/react-html/controls/temporal` |
| `@dynamic-forms/html/controls/media` | `@dynamic-forms/react-html/controls/media` |
| `@dynamic-forms/html/styles.css` | `@dynamic-forms/react-html/styles.css` |

Run typechecking, tests, and the production build after replacement. No form-schema migration or submitted-value transformation is required.

## Compatibility lifecycle

The forwarding package remains supported throughout the v1 line. It may be removed only in a later major release after advance release notes and a migration window. New code must use the canonical package directly.
