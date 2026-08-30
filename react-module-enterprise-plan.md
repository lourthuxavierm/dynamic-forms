# React Module Enterprise Readiness Plan

## Objective

Bring `@lourthuxavierm/dynamic-forms-react` to a production-ready adapter for `@lourthuxavierm/dynamic-forms-core`, with fine-grained rendering, predictable form lifecycle behavior, typed APIs, accessibility support, and strong automated test coverage.

## Scope

- Package: `packages/react`
- Uses `@lourthuxavierm/dynamic-forms-core` as the single source of form state, validation, conditions, dependencies, data sources, and events.
- Excludes visual rendering; those responsibilities remain in renderer packages.

## Phase 0 � Baseline and Package Health

- [ ] Make `pnpm --filter @lourthuxavierm/dynamic-forms-react typecheck`, `test`, and `build` pass.
- [ ] Add a React test environment and ensure `vitest run` succeeds when no component tests previously existed.
- [ ] Confirm public entry points only expose intentional APIs.
- [ ] Document React and React DOM peer-dependency support.
- [ ] Remove obsolete or duplicate exports.

## Phase 1 � Form Provider Contract

- [ ] Define `FormProvider` ownership: controlled store, internally created store, or both.
- [ ] Accept a schema and create/store schema runtime controllers for conditions and dependencies.
- [ ] Create and dispose `ConditionController` and `DependencyController` with the provider lifecycle.
- [ ] Expose a stable context value using memoization.
- [ ] Support provider props for `onSubmit`, `onError`, `onChange`, `onValidate`, and lifecycle event callbacks.
- [ ] Support form-level disabled, loading, read-only, and submitting state.
- [ ] Prevent context updates from causing unrelated field re-renders.

## Phase 2 � Fine-Grained Hooks and Rendering Performance

- [x] Change `useField(name)` to use `store.subscribeToField(name)` rather than global subscriptions.
- [x] Make `useField` subscribe to its value, error, touched, dirty, and condition state as one stable snapshot.
- [ ] Add `useFormState(selector)` with equality checks for scoped form-level state.
- [x] Add `useFieldState(name)` for error, dirty, touched, loading, visible, disabled, and read-only state.
- [x] Add `useWatch(path | paths)` for value-only subscriptions.
- [x] Add `useFormActions()` for stable mutation methods without subscribing to state.
- [x] Use `useSyncExternalStore` correctly for client and SSR snapshots.
- [ ] Benchmark a 100�500 field form to confirm unrelated field updates do not re-render every field.

## Phase 3 � Validation and Submission Integration

- [x] Use `createFormValidator(schema)` for form-wide submission validation by default.
- [x] Provide `validateField`, `validateForm`, `submit`, `reset`, and `resetField` actions.
- [x] Validate field values on configurable triggers: change, blur, submit, and manual.
- [x] Surface field validation state (`isValidating`, error, errors) to hooks and render props.
- [x] Ensure invalid submissions focus the first invalid, visible, enabled field.
- [x] Support async-validator race handling so stale results cannot overwrite newer values.
- [x] Expose submit result/error state and avoid duplicate submissions.

## Phase 4 � Schema-Driven Field Rendering

- [x] Refactor `DynamicField` to resolve registered field definitions and render their React components.
- [x] Pass the complete renderer-neutral `FieldSchema` through to registered components.
- [x] Apply Core-derived visibility, disabled, read-only, and required state before rendering.
- [x] Do not render hidden fields; preserve values while hidden, matching the current Core state policy.
- [x] Provide a clear missing-field-component fallback and optional error boundary.
- [x] Support nested object and array field paths.
- [x] Define a typed `FieldComponentProps` contract for custom fields.
- [x] Add a `DynamicForm` component that renders schema fields and manages the native form submit event.

## Phase 5 � Data Source Integration

- [x] Create `useDataSource(fieldName)` backed by `DataSourceManager`.
- [x] Surface data, loading, error, refresh, cancellation, search, page, and page size.
- [x] Refresh dependent sources through dependency subscriptions.
- [x] Cancel pending requests on unmount or input/search/page changes.
- [x] Avoid duplicate requests through Core cache keys and stable source identifiers.
- [x] Define suspense compatibility as explicitly unsupported.

## Phase 6 � Developer Experience and Type Safety

- [x] Add generic form values: `useForm<TValues>()`, `FormProvider<TValues>`, and typed field paths where practical.
- [x] Preserve `InferSchemaType` for readonly schema declarations.
- [x] Add strongly typed custom field registration helpers.
- [x] Add development-only warnings for duplicate providers, unknown field paths, unknown field types, and missing schemas.
- [x] Expose lightweight hooks for event subscriptions without leaking listener cleanup.
- [x] Publish complete API reference and practical examples for custom controls, nested fields, async validation, and data sources.

## Phase 7 � Accessibility and UX Baseline

- [x] Define accessible field-prop requirements: `id`, `name`, label linkage, description linkage, and error linkage.
- [x] Expose `aria-invalid`, `aria-describedby`, required, disabled, and read-only state through field props.
- [x] Add form error-summary support with focus management.
- [x] Preserve keyboard and focus behavior when conditional visibility changes.
- [x] Support live regions for validation and async loading updates where the renderer needs them.
- [x] Test keyboard navigation and screen-reader-relevant attributes with Testing Library.

## Phase 8 � Testing and Quality Gates

- [x] Unit-test every hook: provider, form actions, field state, watch, and data source hooks.
- [x] Add render-count tests proving field-level subscriptions are isolated.
- [x] Add integration tests for validation, submit, reset, condition changes, and dependency resets.
- [x] Add tests for nested paths, arrays, conditional fields, and asynchronous validation races.
- [x] Add SSR/hydration tests for `useSyncExternalStore` behavior.
- [x] Add accessibility tests for error state, labels, focus movement, and hidden fields.
- [x] Add React Strict Mode tests for subscription cleanup and duplicate-effect safety.
- [x] Add public API/type tests and package build checks.

## Enterprise Definition of Done

- [x] A change to one field does not re-render unrelated fields.
- [x] Provider lifecycle cleanly owns and disposes Core controllers/subscriptions.
- [x] Schema-driven rendering works for registered custom React controls, nested fields, and arrays.
- [x] Validation, submission, conditions, dependencies, and data sources are integrated through React APIs.
- [x] Typecheck, build, unit tests, integration tests, accessibility tests, and Strict Mode tests pass.
- [x] Public APIs are typed, documented, stable, and framework-specific logic remains outside Core.
