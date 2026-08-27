# Angular HTML accessibility

- Status: Baseline semantics implemented; certification incomplete
- Owner: Angular HTML and accessibility maintainers
- Last verified: 2026-08-27
- Applies to: Experimental baseline controls

Baseline controls connect labels, deterministic IDs, errors,
`aria-describedby`, `aria-invalid`, required, disabled, and read-only state.
Errors use alert semantics and focus-visible styling is included.

The renderer has not completed automated axe coverage, composite keyboard
patterns, invalid-submit focus, conditional focus handoff, screen-reader review,
zoom/reflow, forced-colors, or RTL certification. It therefore makes no WCAG
conformance claim yet.
