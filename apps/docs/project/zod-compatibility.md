# Zod compatibility

- Status: Architecture approved; implementation Placeholder
- Owner: Core and adapter maintainers
- Last verified: 2026-08-28
- Applies to: `@dynamic-forms/zod` 0.1.0

`@dynamic-forms/zod` currently exports a marker only. Do not import it for form
validation yet. This page records implementation constraints, not an available API.

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

Placeholder status remains until implementation, unit and compatibility tests,
generated declarations, API reference, framework-neutral examples, migration
guidance, and the Zod release verifier all pass.

See the repository ADR at
`docs/architecture/decisions/zod-adapter.md` for the complete decision.
