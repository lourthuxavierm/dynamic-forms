# Phase 12 status: executable examples and playgrounds

- Status: Complete
- Owner: Examples, renderer, and documentation maintainers
- Last verified: 2026-08-27
- Applies to: Shared examples version 1.0.0

Phase 12 replaces decorative example claims with 14 shared, routed contracts.
React HTML runs all 14. Angular HTML consumes the three examples whose controls
fit its advertised Experimental baseline; unsupported examples are explicit.

## Exit evidence

- Shared schemas and initial values live in `@dynamic-forms/examples`.
- Every catalogue ID has contract tests and a React HTML browser test.
- Shared Angular examples have render, submit, and fallback coverage.
- The React playground exposes state, validation, events, submission, and reset.
- Deterministic screenshots live under the documentation public asset tree.
- Documentation states where data sources, workflows, schema loading, and
  autosave are application-service simulations.

Screenshot equality is protected by deterministic recapture plus browser
coverage of the corresponding fixed route and visible state.
