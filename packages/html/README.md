# @dynamic-forms/html

Compatibility package for `@dynamic-forms/react-html`.

Existing imports continue to work, but new applications should install and import `@dynamic-forms/react-html` directly. The root API, control subpaths, and stylesheet entry are forwarded without maintaining a second renderer implementation.

## Lifecycle

This package remains supported throughout the v1 line. Removal is allowed only in a later major release after advance release notes and a migration window. Follow the canonical [migration guide](../react-html/docs/MIGRATION-FROM-HTML.md) now; new code must not adopt this package.

## Architecture boundary

- Runtime source in this package may import only `@dynamic-forms/react-html`.
- `@dynamic-forms/react-html` must never import this compatibility package.
- Core, React adapter, control, registry, and styling implementation changes belong in `packages/react-html`.
