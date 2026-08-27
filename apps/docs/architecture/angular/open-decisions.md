# Angular open decisions

- Status: Review required
- Owner: Core, future Angular, accessibility, and release maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 approval

The following decisions block ADR acceptance and API stabilization:

1. Final package names and whether interop APIs use secondary entries.
2. Form-scope component/directive naming and selector conventions.
3. Minimum Angular version and multi-major support cadence.
4. RxJS peer dependency versus optional secondary-entry dependency.
5. Whole-form CVA touched/error semantics.
6. `FormGroup` bridge ownership and whether it ships in the first release.
7. Registry collision behavior in production.
8. SSR data-source transfer-cache format and ownership.
9. Default invalid-submit focus and error-summary policy.
10. Angular HTML control parity target for the first prerelease.

Maintainer decisions must be recorded in the repository ADR and reflected in
the compatibility matrix before implementation documentation is published.
