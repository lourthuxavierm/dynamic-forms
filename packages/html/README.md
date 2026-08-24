# @dynamic-forms/html

Compatibility package for `@dynamic-forms/react-html`.

Existing imports continue to work, but new applications should install and import `@dynamic-forms/react-html` directly. The root API, control subpaths, and stylesheet entry are forwarded without maintaining a second renderer implementation.

## Architecture boundary

- Runtime source in this package may import only `@dynamic-forms/react-html`.
- `@dynamic-forms/react-html` must never import this compatibility package.
- Core, React adapter, control, registry, and styling implementation changes belong in `packages/react-html`.
