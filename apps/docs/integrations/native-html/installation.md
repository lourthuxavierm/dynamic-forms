# Native HTML installation

- Status: Planned; no installable standalone renderer
- Owner: Native HTML maintainers (unassigned until implementation begins)
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

There is nothing to install for standalone Native HTML/DOM today. The
repository has no public direct-DOM renderer package, so this page intentionally
contains no installation command or invented package name.

## Do not confuse the compatibility package with a DOM renderer

`@dynamic-forms/html` depends on `@dynamic-forms/react-html` and declares
`react`, `react-dom`, `@dynamic-forms/react`, and `@dynamic-forms/core` as peer
dependencies. Its root source re-exports `@dynamic-forms/react-html`.

Consequently, installing `@dynamic-forms/html` does not provide framework-free
rendering. It exists for old imports during the v1 compatibility window; new
React applications should use the canonical React HTML package directly.

## Readiness requirements

Before an installation command can be published, the project must provide:

1. a real package manifest and public exports;
2. a renderer that does not import React or ReactDOM;
3. an explicit browser and module-format support policy;
4. package-level tests and a clean-install example; and
5. a release and migration policy.

See [framework compatibility](../../project/framework-compatibility.md) for the
currently supported choices.
