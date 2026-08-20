# Core Module Implementation Plan

## Objective

Bring `@dynamic-forms/core` to a stable, testable baseline that can support the React and MUI packages without framework-specific logic.

## Scope

- Package: `packages/core`
- Excludes renderer-specific UI implementation.
- Prioritizes a passing build, correct state management, schema-driven behavior, and test coverage.

## Phase 0 — Restore Build Health

- [x] Replace the invalid `FormField` import in `src/validation/schemaValidators.ts` with `FieldSchema`.
- [x] Make `FormSchema`, `FieldSchema`, and inference helpers accept readonly schemas created with `as const`.
- [x] Verify `InferSchemaType` produces meaningful types instead of `never`.
- [ ] Run `pnpm typecheck`, `pnpm build`, and `pnpm test` successfully.

## Phase 1 — Stabilize FormStore

- [x] Define the public `FormStore` contract, including value, field-state, and form-state operations.
- [x] Add form-level `validate()` and `submit()` hooks/operations with clear ownership boundaries.
- [x] Make `resetField(path)` restore the initial value and clear its dirty, touched, and error state by default.
- [x] Ensure `reset()` notifies both global and affected field subscribers.
- [x] Batch `setValues()` into one state update and one global notification.
- [x] Avoid duplicate notifications when `setValue()` also marks a field as touched.
- [x] Expose immutable snapshots, or document and enforce an immutable update contract.
- [x] Keep nested object and array paths consistent for values, errors, dirty state, and touched state.
- [x] Replace public `any` values with generics and path/value typing where practical.

## Phase 2 — Complete Validation

- [x] Implement `multipleOf`, `minItems`, `maxItems`, and `uniqueItems` from `FieldValidation`.
- [x] Define consistent required-value semantics for strings, booleans, arrays, numbers, and objects.
- [x] Support asynchronous validators.
- [x] Add cross-field validator support through the complete form value set.
- [x] Connect validation results to FormStore errors and `valid` state.
- [x] Support form-wide validation before submission.
- [x] Add stable validation error codes in addition to user-facing messages.

## Phase 3 — Expand the Native Schema Contract

- [ ] Add declarative condition properties: `visibleWhen`, `disabledWhen`, `requiredWhen`, and `readonlyWhen`.
- [ ] Add `dependsOn` and dependency behavior configuration to field schemas.
- [ ] Add a renderer-neutral `dataSource` configuration model.
- [ ] Add typed field configuration/metadata for specialized controls without coupling Core to MUI.
- [ ] Support readonly schema declarations throughout nested object and array fields.
- [ ] Validate field references, malformed definitions, invalid nested layouts, and duplicate names.

## Phase 4 — Integrate Conditions and Dependencies

- [ ] Support nested paths when evaluating conditions.
- [ ] Add compound conditions: `and`, `or`, and `not`.
- [ ] Re-evaluate relevant conditions when a referenced field changes.
- [ ] Add dependency-cycle detection with actionable error messages.
- [ ] Resolve transitive dependents in deterministic order.
- [ ] Define dependent-field invalidation/reset behavior.
- [ ] Trigger dependent data-source refreshes after upstream changes.

## Phase 5 — Complete Data Sources and Events

- [ ] Associate a data source with a schema field.
- [ ] Surface loading, success, and error state through Core.
- [ ] Support static, function, URL/REST, searchable, paginated, and dependent data sources.
- [ ] Add caching and cancellation policies.
- [ ] Emit lifecycle events for value changes, field changes, validation, reset, and submission.
- [ ] Ensure event payloads contain field path, previous value, next value, and relevant context.

## Phase 6 — Verification and API Readiness

- [ ] Add unit tests for all FormStore operations and notification behavior.
- [ ] Add tests for nested paths, array paths, reset behavior, batching, and unsubscription.
- [ ] Add validation tests for every constraint, async validation, and cross-field validation.
- [ ] Add schema validation tests for invalid references and malformed nested schemas.
- [ ] Add dependency tests for chains, transitive updates, and cycles.
- [ ] Add data-source and event-emitter tests.
- [ ] Add public API/type tests for exports and `InferSchemaType`.
- [ ] Document the finalized Core API and remove obsolete `@dynamic-ui/*` references.

## Definition of Done

- `pnpm typecheck`, `pnpm build`, and `pnpm test` pass from the repository root.
- Core has no React, MUI, or renderer-specific dependencies.
- Form state updates are immutable, correctly scoped, and efficiently subscribed to.
- Schema conditions, dependencies, validation, data sources, and events work together through a documented Core API.
- Critical behavior is covered by automated tests.
