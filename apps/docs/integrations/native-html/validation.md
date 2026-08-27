# Native HTML validation

- Status: Planned renderer integration; Core validation available
- Owner: Core, accessibility, and future Native HTML maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

Validation rules and validation state are framework-independent Core behavior.
A future DOM renderer must decide how that state is presented and announced.

## Required behavior

- Define validation triggers for input, blur, submit, and programmatic changes.
- Preserve synchronous and asynchronous Core validation ordering.
- Map invalid state to accessible descriptions and `aria-invalid` where applicable.
- Focus the first invalid control only under a documented submission policy.
- Distinguish browser constraint validation from Dynamic Forms validation.
- Prevent stale asynchronous results from replacing newer state.

The renderer must not depend on React lifecycle or React event semantics. See
[schema validation](../../schema/validation.md) and
[runtime submission](../../runtime/submission.md) for existing shared behavior.
