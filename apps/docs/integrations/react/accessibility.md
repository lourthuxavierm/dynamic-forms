# React accessibility responsibilities

- Status: Implemented primitives; application controls remain responsible
- Owner: React and accessibility maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-form-engine/react` 0.1.0

The headless adapter supplies accessibility IDs, ARIA relationships, field data
attributes, `FormErrorSummary`, `LiveRegion`, invalid-submit focus, and focus
handoff when a focused conditional field becomes hidden.

Because React supplies no default control markup, an application control must
connect labels, descriptions, and errors; expose required, invalid, disabled,
and read-only state; implement keyboard semantics; and place the supplied data
attributes on its focusable element. Using the adapter does not by itself create
an accessible UI.
