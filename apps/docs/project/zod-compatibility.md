# Zod compatibility

- Status: Package foundation implemented; validation Placeholder
- Owner: Core and adapter maintainers
- Last verified: 2026-08-28
- Applies to: `@dynamic-forms/zod` 0.1.0

`@dynamic-forms/zod` now exports framework-neutral structural types and produces
package declarations. It does not export form or field validator factories yet.
Do not import it for application validation.

## Candidate version policy

| Zod line | Candidate range | Current support |
| --- | --- | --- |
| Zod 3 | `^3.25.0` | Not certified |
| Zod 4 | `^4.0.0` | Not certified |
| Zod Mini | Not selected | Not supported |

The manifest range identifies versions intended for the implementation matrix.
Support begins only after package builds, declarations, and behavior tests pass
against both selected majors.

## Approved boundary

```text
Zod schema
    |
@dynamic-forms/zod
    |
Core FormValidator / Validator
    |
React, Angular, or another consumer
```

Core and renderers never import Zod. The adapter produces Core-compatible errors.

## Approved semantics

- Always accommodate asynchronous validation.
- Convert `['contacts', 0, 'email']` to `contacts[0].email`.
- Map an empty issue path to `_form`.
- Keep the first message per path by default.
- Make multiple-message joining explicit and deterministic.
- Do not silently apply Zod coercions, defaults, or transformed output to store values.
- Preserve server validation as the authoritative security boundary.

## Promotion gate

Placeholder status remains until validator implementation, unit and compatibility tests,
generated declarations, API reference, framework-neutral examples, migration
guidance, and the Zod release verifier all pass.

## Phase 1 foundation

- The placeholder runtime marker has been removed.
- Strict type checking and declaration-only output are configured.
- ESM and CommonJS bundles remain supported.
- `sideEffects: false` declares the type-only foundation tree-shakeable.
- Structural contracts do not expose a concrete Zod-major class.
- Validator factories remain intentionally unavailable.

See the repository ADR at
`docs/architecture/decisions/zod-adapter.md` for the complete decision.
