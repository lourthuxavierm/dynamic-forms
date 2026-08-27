# React HTML accessibility

- Status: Implemented; release evidence includes manual checks
- Owner: React HTML and accessibility maintainers
- Last verified: 2026-08-27
- Applies to: React HTML v1 controls

React HTML connects labels, descriptions, errors, required/invalid state,
keyboard interactions, focus handoff, error summary, live regions, structural
semantics, and layout semantics. Representative automated axe coverage is
supplemented by keyboard, zoom/reflow, forced-colors, NVDA, VoiceOver,
localization, and RTL release procedures.

The package targets WCAG 2.2 AA, but a consuming application's schema, custom
controls, layout, styles, language, and surrounding UI remain part of its
conformance scope. Follow the complete checklist in the
[deep-reference catalogue](./deep-references.md).
