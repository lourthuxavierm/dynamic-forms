# Migrating from `@lourthuxavierm/dynamic-forms-html`

`@lourthuxavierm/dynamic-forms-react-html` is the canonical React native-HTML renderer. The legacy package currently forwards every public entry, so migration changes module specifiers only; schemas, values, registries, components, and CSS class hooks remain unchanged.

## Replace the dependency

```sh
pnpm remove @lourthuxavierm/dynamic-forms-html
pnpm add @lourthuxavierm/dynamic-forms-react-html
```

## Replace imports

| Legacy import | Canonical import |
| --- | --- |
| `@lourthuxavierm/dynamic-forms-html` | `@lourthuxavierm/dynamic-forms-react-html` |
| `@lourthuxavierm/dynamic-forms-html/core` | `@lourthuxavierm/dynamic-forms-react-html/core` |
| `@lourthuxavierm/dynamic-forms-html/controls/baseline` | `@lourthuxavierm/dynamic-forms-react-html/controls/baseline` |
| `@lourthuxavierm/dynamic-forms-html/controls/text` | `@lourthuxavierm/dynamic-forms-react-html/controls/text` |
| `@lourthuxavierm/dynamic-forms-html/controls/composites` | `@lourthuxavierm/dynamic-forms-react-html/controls/composites` |
| `@lourthuxavierm/dynamic-forms-html/controls/specialized` | `@lourthuxavierm/dynamic-forms-react-html/controls/specialized` |
| `@lourthuxavierm/dynamic-forms-html/controls/temporal` | `@lourthuxavierm/dynamic-forms-react-html/controls/temporal` |
| `@lourthuxavierm/dynamic-forms-html/controls/media` | `@lourthuxavierm/dynamic-forms-react-html/controls/media` |
| `@lourthuxavierm/dynamic-forms-html/styles.css` | `@lourthuxavierm/dynamic-forms-react-html/styles.css` |

Run typechecking, tests, and the production build after replacement. No form-schema migration or submitted-value transformation is required.

## Compatibility lifecycle

The forwarding package remains supported throughout the v1 line. It may be removed only in a later major release after advance release notes and a migration window. New code must use the canonical package directly.
