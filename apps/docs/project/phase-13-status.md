# Phase 13 status: automated API reference

- Status: Complete
- Owner: Package owners and documentation maintainers
- Last verified: 2026-08-27
- Applies to: Stable and compatibility public package entry points

Phase 13 generates deterministic API pages and an export manifest from the
TypeScript compiler's view of package entry points. Handwritten annotations add
purpose and guide links without replacing task-oriented documentation.

## Covered entry points

- `@dynamic-forms/core`
- `@dynamic-forms/react`
- `@dynamic-forms/react-html`
- `@dynamic-forms/html` compatibility surface

Experimental Angular packages remain in their integration documentation until
their public contracts reach the stable API-reference policy.

## Drift gates

- `pnpm docs:api` regenerates checked-in reference artifacts.
- `pnpm docs:api:check` fails when source exports and generated files differ.
- API verification fails for an undocumented export or a heading whose export
  no longer exists.
- `@internal` symbols are excluded.
- `@deprecated` metadata displays its message, replacement, and removal target
  when those values are declared.
