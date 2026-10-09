# React Module Enterprise Readiness Plan

## Objective

Bring `@dynamic-form-engine/react` to a production-ready adapter for `@dynamic-form-engine/core`, with fine-grained rendering, predictable form lifecycle behavior, typed APIs, accessibility support, and strong automated test coverage.

## Scope

- Package: `packages/react`
- Uses `@dynamic-form-engine/core` as the single source of form state, validation, conditions, dependencies, data sources, and events.
- Excludes visual rendering; those responsibilities remain in renderer packages.

## Phase 0 — Baseline and Package Health

- [x] Make `pnpm --filter @dynamic-form-engine/react typecheck`, `test`, and `build` pass.
- [x] Add a React test environment and ensure `vitest run` succeeds when no component tests previously existed.
- [x] Confirm public entry points only expose intentional APIs.
- [x] Document React and React DOM peer-dependency support.
- [x] Remove obsolete or duplicate exports.

## Phase 1 — Form Provider Contract

- [x] Define `FormProvider` ownership: controlled store, internally created store, or both.
- [x] Accept a schema and create/store schema runtime controllers for conditions and dependencies.
- [x] Create and dispose `ConditionController` and `DependencyController` with the provider lifecycle.
- [x] Expose a stable context value using memoization.
- [x] Support provider props for `onSubmit`, `onError`, `onChange`, `onValidate`, and lifecycle event callbacks.
- [x] Support form-level disabled, loading, read-only, and submitting state.
- [x] Prevent context updates from causing unrelated field re-renders.

## Phase 2 — Fine-Grained Hooks and Rendering Performance

- [x] Change `useField(name)` to use `store.subscribeToField(name)` rather than global subscriptions.
- [x] Make `useField` subscribe to its value, error, touched, dirty, and condition state as one stable snapshot.
- [x] Add `useFormState(selector)` with equality checks for scoped form-level state.
- [x] Add `useFieldState(name)` for error, dirty, touched, loading, visible, disabled, and read-only state.
- [x] Add `useWatch(path | paths)` for value-only subscriptions.
- [x] Add `useFormActions()` for stable mutation methods without subscribing to state.
- [x] Use `useSyncExternalStore` correctly for client and SSR snapshots.
- [x] Benchmark a 100—500 field form to confirm unrelated field updates do not re-render every field.

## Phase 3 — Validation and Submission Integration

- [x] Use `createFormValidator(schema)` for form-wide submission validation by default.
- [x] Provide `validateField`, `validateForm`, `submit`, `reset`, and `resetField` actions.
- [x] Validate field values on configurable triggers: change, blur, submit, and manual.
- [x] Surface field validation state (`isValidating`, error, errors) to hooks and render props.
- [x] Ensure invalid submissions focus the first invalid, visible, enabled field.
- [x] Support async-validator race handling so stale results cannot overwrite newer values.
- [x] Expose submit result/error state and avoid duplicate submissions.

## Phase 4 — Schema-Driven Field Rendering

- [x] Refactor `DynamicField` to resolve registered field definitions and render their React components.
- [x] Pass the complete renderer-neutral `FieldSchema` through to registered components.
- [x] Apply Core-derived visibility, disabled, read-only, and required state before rendering.
- [x] Do not render hidden fields; preserve values while hidden, matching the current Core state policy.
- [x] Provide a clear missing-field-component fallback and optional error boundary.
- [x] Support nested object and array field paths.
- [x] Define a typed `FieldComponentProps` contract for custom fields.
- [x] Add a `DynamicForm` component that renders schema fields and manages the native form submit event.

## Phase 5 — Data Source Integration

- [x] Create `useDataSource(fieldName)` backed by `DataSourceManager`.
- [x] Surface data, loading, error, refresh, cancellation, search, page, and page size.
- [x] Refresh dependent sources through dependency subscriptions.
- [x] Cancel pending requests on unmount or input/search/page changes.
- [x] Avoid duplicate requests through Core cache keys and stable source identifiers.
- [x] Define suspense compatibility as explicitly unsupported.

## Phase 6 — Developer Experience and Type Safety

- [x] Add generic form values: `useForm<TValues>()`, `FormProvider<TValues>`, and typed field paths where practical.
- [x] Preserve `InferSchemaType` for readonly schema declarations. (Now deprecated in Core in favor of `InferFormValues`; removal 2.0.0.)
- [x] Add strongly typed custom field registration helpers.
- [x] Add development-only warnings for duplicate providers, unknown field paths, unknown field types, and missing schemas.
- [x] Expose lightweight hooks for event subscriptions without leaking listener cleanup.
- [x] Publish complete API reference and practical examples for custom controls, nested fields, async validation, and data sources.

## Phase 7 — Accessibility and UX Baseline

- [x] Define accessible field-prop requirements: `id`, `name`, label linkage, description linkage, and error linkage.
- [x] Expose `aria-invalid`, `aria-describedby`, required, disabled, and read-only state through field props.
- [x] Add form error-summary support with focus management.
- [x] Preserve keyboard and focus behavior when conditional visibility changes.
- [x] Support live regions for validation and async loading updates where the renderer needs them.
- [x] Test keyboard navigation and screen-reader-relevant attributes with Testing Library.

## Phase 8 — Testing and Quality Gates

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

## Completion evidence (28 September 2026)

All items are complete. The audit for this pass also found that several items
previously marked done did not hold; they are fixed and now covered by tests
that fail against the old implementation.

| Item | Evidence |
| --- | --- |
| Package health (Phase 0) | `typecheck`, `test`, `build` pass; tests run in `happy-dom`. `api-report.json` records the 40 intentional exports and `pnpm check:api` gates changes. `pnpm verify:react-release` (in CI) checks the packed ESM/CJS exports and bundler, Node ESM, and Node CommonJS type resolution. **Fixed:** published declarations were unresolvable under `nodenext`, and 10 test declaration files were published. |
| Peer dependencies | React and React DOM `^18 \|\| ^19`, asserted by `public-api.test.ts`; the React 18.3/19.2 CI matrix now runs this package's typecheck and tests. |
| Provider ownership and lifecycle (Phase 1) | Controlled `store` or provider-owned store from `defaultValues`; controllers created in an effect and disposed on unmount or schema/store change (`provider.test.tsx`). |
| Stable context and actions | Context changes only with store/registry/schema/controller/settings; actions and controllers survive inline callbacks. **Fixed:** field validation changed the context (re-rendering every consumer) and inline `onDataSourceRefresh` recreated the controllers on every render. |
| Provider callbacks and form-level state | `onSubmit`, `onError` (now also validator failures), `onChange`, `onValidate`, `onReset`, `onEvent`; `disabled`, `readOnly`, `disableWhileSubmitting`. **Fixed:** form-level disabled/submitting never reached field props. |
| `useField` snapshot (Phase 2) | `useField` now includes condition state from the same single subscription as value and field state. |
| `useFormState(selector, equality)` | Cached selection with equality and exported `shallowEqual`. **Fixed:** object-returning selectors produced a new snapshot every read. |
| 100–500 field benchmark | `quality-gates.test.tsx`: 500 fields; one change or one validation re-renders one field; reset renders each field at most once. **Fixed in Core:** `FormStore` never notified descendant field subscribers when an ancestor was replaced. |
| SSR and hydration (Phase 8) | Conditions apply during server rendering and the first client render; `hydrateRoot` without mismatches. **Fixed:** conditionally hidden fields were rendered on the server and flashed on the client. |
| Strict Mode | A subscription tracker shows zero store subscriptions after unmount; hidden-value policies apply once. |
| Validation and data sources (Phases 3 and 5) | **Fixed:** abort signals are passed to composed validators and dependency refreshes; invalid-submit focus uses document order and skips disabled or hidden controls; inline `useDataSource` configs no longer refetch in a loop. |
