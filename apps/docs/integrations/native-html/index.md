# Standalone Native HTML/DOM

- Status: Planned
- Owner: Native HTML maintainers (unassigned until implementation begins)
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

There is currently no framework-independent renderer that mounts Dynamic Forms
directly into the DOM. This section records the verified boundary and the
requirements a future implementation must satisfy; it is not a usage guide for
an existing API.

## Architecture decision

In this documentation, **Standalone Native HTML/DOM** means a renderer that
uses browser-native elements without React or another UI framework. It does not
mean static HTML generation and it does not mean the legacy
`@lourthuxavierm/dynamic-forms-html` package.

The shipped renderer is [React HTML](../../packages/react-html.md), which uses
browser-native elements through React. `@lourthuxavierm/dynamic-forms-html` is only a
React-dependent compatibility package forwarding React HTML.

## Decision guide

| Requirement | Current choice |
| --- | --- |
| Browser-native controls in a React application | Use `@lourthuxavierm/dynamic-forms-react-html` |
| Existing code importing `@lourthuxavierm/dynamic-forms-html` | Migrate to `@lourthuxavierm/dynamic-forms-react-html` |
| Direct DOM rendering with no React dependency | Not available; integration is Planned |
| Framework-independent form state without a renderer | Use `@lourthuxavierm/dynamic-forms-core` |

## Reference

- [Installation and package identity](./installation.md)
- [Rendering boundary](./rendering.md)
- [Form values](./form-values.md)
- [Events](./events.md)
- [Validation](./validation.md)
- [Custom controls](./custom-controls.md)
- [Styling](./styling.md)
- [Accessibility](./accessibility.md)
- [Testing contract](./testing.md)
- [Complete-example release gate](./complete-example.md)

## Publication gate

This integration may be relabeled Implemented only after a public package,
direct-DOM renderer, tests, runnable playground example, accessibility checks,
and supported-browser policy exist. Until then, pages in this section describe
requirements and confirmed absences, never speculative APIs.
