# Phase 4 Core schema documentation status

- Status: Implemented and verified
- Owner: Core and documentation maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-forms/core` 0.1.0

## Delivered

- Schema overview and canonical landing page
- `FormSchema` and `FieldSchema` property references
- Default-value and reset boundaries
- Schema and value validation
- Conditions and grouped operators
- Dependency refresh and reset behavior
- Static, function, and URL data sources
- Metadata governance
- Nested object paths and inference
- Array values, constraints, paths, and identity boundaries
- Core schema versus React HTML layout separation
- Application-owned schema versioning and migration policy

## Accuracy boundaries

- A custom type may be Core-valid but unsupported by a renderer.
- `validateSchema` checks structural consistency, not renderer registration or
  organizational schema policy.
- `FieldSchema.metadata` has no automatic Core semantics.
- `FormSchema` has no layout property in the current public contract.
- `FormSchema.version` is opaque and does not migrate stored values.
- Function data sources are trusted runtime code rather than transportable JSON.
- File values and several runtime objects are not JSON-serializable.

## Verification evidence

- Fourteen canonical schema pages exist.
- All 21 current `FieldSchema` properties and all 3 `FormSchema` properties are
  covered by the dedicated schema verifier.
- Documentation verification compiles 23 TypeScript/TSX snippets.
- Production VitePress build passes.
- Fourteen Chromium documentation tests pass, including schema discoverability,
  layout boundaries, and application-owned versioning.

## Remaining repository constraints

The broad Markdown ignore rule and sandbox-blocked edits to pre-existing tracked
configuration files still prevent normal Git visibility, script wiring, and live
sidebar integration for new pages in this session.
