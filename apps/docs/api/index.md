# API reference

- Status: Generated and curated
- Owner: Package owners and documentation maintainers
- Last verified: 2026-08-27
- Applies to: Generated `@dynamic-forms/*` package exports with explicit maturity labels

The generated reference records the compiler-visible public surface. Generated
signatures do not replace task-oriented guides. Each package page links back to
the relevant integration, runtime, controls, and examples documentation.

## Package references

- [`@dynamic-form-engine/core`](./generated/core)
- [`@dynamic-form-engine/react`](./generated/react)
- [`@dynamic-form-engine/react-html`](./generated/react-html)
- [`@dynamic-form-engine/html`](./generated/html) compatibility surface
- [`@dynamic-form-engine/zod`](./generated/zod) Release-ready validation adapter

The Zod API is included because its public factories, dual-major matrix, and
publish-artifact release gate are implemented; its generated page retains a
Release-ready maturity label. Experimental Angular APIs remain in their integration documentation until
their compatibility contract reaches the generated-reference policy. Placeholder
packages are excluded because marker constants are not usable integrations.

## Generation contract

Run `pnpm docs:api` after changing a public export. The generator uses the
TypeScript program and package entry points, excludes `@internal` symbols, and
writes deterministic Markdown plus a JSON export manifest. Handwritten purpose
and links live in `api/annotations.json` and survive regeneration.

`pnpm docs:verify` runs drift mode. It fails when a public export is missing from
the reference, a documented export no longer exists, or generated artifacts are
stale.

## Deprecation policy

Add `@deprecated` to the exported declaration with a replacement and removal
target. Generated entries display that metadata. A declaration without the tag
is not presented as deprecated, and documentation must not invent a lifecycle.
