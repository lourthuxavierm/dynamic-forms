# React Hook Form Adapter Implementation Plan

## Objective

Implement `@dynamic-form-engine/rhf` as a production-ready React Hook Form 7 adapter and verify it end to end in a real browser application. RHF owns values, dirty/touched state, errors, resets, and submission. Dynamic Forms owns schemas, conditions, dependencies, validation definitions, and renderer contracts.

## Scope

- Package: `packages/rhf`
- E2E application: `apps/rhf-playground`
- Integrates with Core, React, React HTML, and React Hook Form 7
- Supports React 18 and 19
- Keeps the published adapter renderer-neutral
- Excludes Angular and adapters for other form libraries

## Architecture Contracts

- RHF is the sole authoritative runtime form state.
- Dynamic Forms schemas are the authoritative declarative definition.
- Synchronization is directional and protected against feedback loops.
- Nested names use RHF-compatible dot paths.
- Error conversion preserves nested object and array paths.
- Hidden-field registration and value retention are configurable and documented.
- Async validation and data-source operations suppress stale results.

## Phase 0 — Contract and Package Baseline

### Deliverables

- [x] Define ownership for values, errors, validation, conditions, dependencies, and submission.
- [x] Define hidden-field retain/unregister policies.
- [x] Define supported React and RHF versions.
- [x] Add required React adapter dependency and RHF test dependencies.
- [x] Generate declarations during package builds.
- [x] Add package README, API outline, and boundary documentation.
- [x] Remove `--passWithNoTests` after the first tests land.

### Verification

- [x] RHF package builds and typechecks.
- [x] Package-boundary verification passes.
- [x] Export map resolves in ESM, CommonJS, and TypeScript.

### Exit criteria

State ownership is unambiguous and package metadata matches repository conventions.

## Phase 1 — Value and Field Bridge

### Deliverables

- [x] Implement `DynamicFormRHFProvider` with internal or external `UseFormReturn` support.
- [x] Implement `useDynamicFormRHF`.
- [x] Implement `RHFField` with `Controller` or `useController`.
- [x] Support typed field names with `FieldPath`-compatible generics.
- [x] Preserve strings, numbers, booleans, arrays, files, dates, and nullable values.
- [x] Propagate RHF values to Dynamic Forms conditions without update loops.
- [x] Dispose subscriptions safely under normal and Strict Mode lifecycles.

### Tests

- [x] Default and programmatic values render correctly.
- [x] UI edits update RHF once.
- [x] External RHF instances work.
- [x] Value types are preserved.
- [x] Strict Mode creates no duplicate subscriptions or updates.

### Exit criteria

Basic fields work bidirectionally while RHF remains the only runtime state owner.

## Phase 2 — Validation and Error Interoperability

### Deliverables

- [x] Implement `createRHFResolver`.
- [x] Implement `toRHFErrors` for nested and indexed paths.
- [x] Support required, text, numeric, array, pattern, custom, cross-field, and form validation.
- [x] Support change, blur, submit, and manual validation modes.
- [x] Preserve error codes and messages.
- [x] Prevent stale async validation results from winning.
- [x] Integrate error-summary announcement and first-invalid-field focus.

### Tests

- [x] Every native constraint maps to RHF errors.
- [x] Nested and array errors have the expected RHF shape.
- [x] Cross-field and form errors are preserved.
- [x] Errors clear after correction.
- [x] Latest async validation wins.
- [x] Invalid submission focuses the correct field.

### Exit criteria

RHF `formState.errors` accurately and deterministically represents Dynamic Forms validation.

## Phase 3 — Conditions, Dependencies, and Data Sources

### Deliverables

- [x] Drive visible, disabled, required, and read-only conditions from current RHF values.
- [x] Implement documented hidden-field registration/value policies.
- [x] Synchronize dependent reset and invalidation behavior.
- [x] Refresh dependent data sources after upstream changes.
- [x] Expose loading, success, error, retry, and cancellation state.
- [x] Suppress obsolete validation and data-source responses.

### Tests

- [x] Conditions update immediately after controlling values change.
- [x] Conditional required validation uses current state.
- [x] Hidden fields follow each supported policy.
- [x] Dependency chains reset deterministically.
- [x] Stale data-source responses cannot replace newer data.
- [x] Failed requests can be retried.

### Exit criteria

Schema-driven runtime behavior stays consistent with RHF values and form state.

## Phase 4 — Structural Fields and Lifecycle

### Deliverables

- [x] Bridge arrays to RHF `useFieldArray`.
- [x] Support nested objects and arrays of objects.
- [x] Preserve stable identities during append, remove, move, swap, and replace.
- [x] Implement adapter-aware field and form reset.
- [x] Support compatible `trigger`, `setError`, `clearErrors`, and `setFocus` operations.
- [x] Define file reset and serialization behavior.
- [x] Remove orphaned values, errors, and dirty state after structural changes.

### Tests

- [x] Nested values submit correctly.
- [x] Array operations preserve order, values, and identity.
- [x] Indexed errors follow reordered items correctly.
- [x] Field reset restores its default and state.
- [x] Form reset clears values, errors, dirty state, and touched state appropriately.
- [x] Removed entries leave no orphaned state.

### Exit criteria

Nested structures, arrays, and lifecycle operations remain internally consistent.

## Phase 5 — Public API and Developer Experience

### Deliverables

- [ ] Implement `RHFForm` for schema rendering and native submission.
- [ ] Support custom registries and renderer-neutral controls.
- [ ] Add typed examples for inferred and explicit form-value types.
- [ ] Add development diagnostics for conflicting providers and invalid fields.
- [ ] Add public API and type-contract tests.
- [ ] Document migration from direct RHF `Controller` usage.
- [ ] Include the adapter in API-reference generation.

### Tests

- [ ] Public exports match documentation.
- [ ] Type tests cover nested paths, arrays, inferred schemas, and external instances.
- [ ] Custom controls receive correct state and mutations.
- [ ] Diagnostics appear only in development.

### Exit criteria

Consumers can build a complete typed schema-driven RHF form using documented APIs.

## Phase 6 — E2E Playground and Browser Suite

### Deliverables

- [ ] Create private `apps/rhf-playground` workspace application.
- [ ] Add deterministic basic, conditional, nested, async, dependent, and array fixtures.
- [ ] Display submitted JSON, watched values, errors, dirty/touched fields, validity, and submit count.
- [ ] Add an isolated Playwright configuration and Vite port.
- [ ] Use accessible selectors as the primary test interface.
- [ ] Mock async validation and data sources deterministically.

### Browser scenarios

- [ ] Typed basic-value submission.
- [ ] Required errors, correction, and resubmission.
- [ ] Conditional visibility and required validation.
- [ ] Nested object editing and submission.
- [ ] Array append, edit, reorder, remove, and submission.
- [ ] Field and form resets.
- [ ] Async validation race suppression.
- [ ] Dependent data-source refresh and stale-request suppression.
- [ ] Programmatic updates through an external RHF instance.
- [ ] Keyboard-only completion and error-summary focus.
- [ ] Strict Mode update and submit counts.
- [ ] Axe checks for initial, invalid, conditional, and array states.

### Exit criteria

All supported workflows pass in Chromium against built workspace packages without arbitrary waits.

## Phase 7 — Compatibility, CI, and Release

### Deliverables

- [ ] Add React 18 and React 19 compatibility jobs.
- [ ] Test the oldest and newest supported RHF 7 versions.
- [ ] Run browser E2E on the primary supported version set.
- [ ] Add a packed-package consumer smoke test.
- [ ] Add CI path filters for RHF, Core, React, React HTML, the playground, and lockfile.
- [ ] Upload Playwright traces and reports on failure.
- [ ] Add root `rhf:e2e` and `verify:rhf` commands.
- [ ] Include RHF in documentation governance and release verification.
- [ ] Replace placeholder maturity labels and add release notes.

### Required gates

- [ ] Frozen installation
- [ ] Package boundaries
- [ ] Lint
- [ ] Typecheck
- [ ] Unit and integration tests
- [ ] Package and playground builds
- [ ] Playwright and accessibility tests
- [ ] Packed-package smoke test
- [ ] Documentation verification

### Exit criteria

The full declared compatibility range and published artifact are supported by automated evidence.

## Recommended Order

1. Freeze ownership and hidden-field contracts.
2. Establish package metadata, declarations, and initial tests.
3. Implement the value and field bridge.
4. Add validation and nested error conversion.
5. Integrate conditions, dependencies, and data sources.
6. Add structural fields and lifecycle operations.
7. Finalize public APIs, types, and documentation.
8. Build the E2E playground and browser suite.
9. Add compatibility, CI, packaging, and release gates.

## Definition of Done

- The package contains no placeholder exports or placeholder test scripts.
- RHF is the documented and verified runtime state/submission owner.
- Values, errors, dirty/touched state, conditions, dependencies, arrays, resets, and async work remain synchronized.
- Nested and indexed schemas are typed and tested.
- Strict Mode produces no duplicate subscriptions or logical events.
- Accessibility behavior is verified in browser tests.
- React 18, React 19, and the declared RHF 7 range pass compatibility checks.
- Root lint, typecheck, tests, builds, documentation checks, and RHF E2E pass.
- Root and package documentation identify the adapter as implemented.
