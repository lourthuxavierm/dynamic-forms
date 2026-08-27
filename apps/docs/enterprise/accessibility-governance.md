# Accessibility governance and verification

Accessible markup is necessary but insufficient. The adopting organization owns
conformance criteria, testing evidence, exception management, and regression
control for its schemas, controls, content, and workflows.

## Required evidence

- Automated checks on representative states in CI.
- Keyboard-only review, including errors, conditional fields, and dialogs.
- Screen-reader testing on the organization's supported browser/AT matrix.
- Zoom, reflow, contrast, forced-colors, reduced-motion, and touch-target review.
- Clear labels, instructions, required state, error association, summaries, and
  focus movement after validation or step changes.
- Review of translated, right-to-left, loading, offline, timeout, and conflict states.

Custom controls need documented semantics, keyboard behavior, focus ownership,
and accessible names before registration. Treat schema content changes like code:
lint, preview, test, approve, and retain evidence. Record defects with severity,
owner, remediation date, and approved exception expiry.
