# Testing Angular integration

- Status: Implemented baseline tests
- Owner: Angular and quality maintainers
- Last verified: 2026-08-27
- Applies to: Angular 22.1.3 baseline

Package tests exercise readonly signal projection, conditional state,
validation, submission, Observable events, and cleanup. Typechecking uses the
package-local TypeScript 6.0 compiler. Production packaging verifies ESM, CJS,
and declaration outputs.

Application tests should create a real facade and schema, assert signals and
Core values, dispose direct facades, and run the target application's zoneless,
SSR, and hydration modes. The current release has browser-build evidence but
not SSR/hydration certification.
