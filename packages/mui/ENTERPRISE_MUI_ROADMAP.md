# Dynamic Forms — Enterprise MUI Roadmap

> Implementation tracker for `@dynamic-forms/mui`. The objective is not merely to wrap MUI components; every control must participate consistently in schema rendering, form state, validation, conditions, dependencies, data sources, accessibility, theming, and DevTools.

## Status legend

- [ ] Not started
- [~] In progress
- [x] Complete and verified
- **P0** — required for a credible first release
- **P1** — required for enterprise-ready v1
- **P2** — advanced or post-v1

## 1. Package foundation

- [x] **P0** Define a stable `MuiFieldProps<TField, TValue>` contract.
- [x] **P0** Create `MuiFieldRegistry` with typed registration and overrides.
- [x] **P0** Implement `createDefaultMuiRegistry()`.
- [x] **P0** Implement `MuiFieldRenderer` with useful unknown-control errors.
- [x] **P0** Implement `MuiFormRenderer` for fields, groups and layouts.
- [ ] **P0** Keep React, MUI and date libraries as peer dependencies.
- [ ] **P0** Export ESM, CJS and TypeScript declarations.
- [ ] **P0** Verify tree-shaking and prevent side effects.
- [ ] **P0** Define consistent controlled/uncontrolled value behavior.
- [x] **P0** Add component-level error boundaries and development warnings.
- [x] **P1** Support registry extension without replacing default controls.
- [ ] **P1** Support lazy-loaded custom controls.
- [ ] **P1** Publish package-size and bundle-composition reports.

## 2. Shared field infrastructure

- [x] **P0** Create `MuiFieldShell` for label, required mark, helper text and errors.
- [x] **P0** Create `MuiFieldError` with stable `aria-describedby` IDs.
- [ ] **P0** Create `MuiFieldLoading` and skeleton behavior.
- [ ] **P0** Create consistent empty, disabled and read-only presentations.
- [ ] **P0** Map Core metadata: touched, dirty, validating, loading and errors.
- [ ] **P0** Ensure hidden fields do not leave broken layout space.
- [ ] **P0** Standardize `onChange`, `onBlur` and value normalization.
- [ ] **P0** Forward refs to the focusable input.
- [ ] **P0** Support autofocus and programmatic focus-on-error.
- [ ] **P1** Add prefix, suffix, adornment, tooltip and description slots.
- [ ] **P1** Add character counters and input-length feedback.
- [ ] **P1** Support compact, normal and comfortable density.
- [ ] **P1** Support component and slot-prop overrides.
- [ ] **P1** Add field-level render diagnostics for DevTools.

## 3. Core input controls

- [~] **P0** `MuiTextField`
- [~] **P0** `MuiNumberField`
- [~] **P0** `MuiTextarea`
- [~] **P0** `MuiUrlField`
- [ ] **P0** `MuiEmailField`
- [ ] **P0** `MuiPasswordField` with show/hide and password-manager support
- [ ] **P0** `MuiIntegerField`
- [ ] **P0** `MuiDecimalField`
- [ ] **P0** `MuiHiddenField`
- [ ] **P1** `MuiPhoneField`
- [ ] **P1** `MuiMaskedField`
- [ ] **P1** `MuiOtpField`
- [ ] **P1** `MuiPinField`
- [ ] **P1** `MuiSearchField`
- [ ] **P2** `MuiRichTextField`
- [ ] **P2** `MuiCodeEditorField`

## 4. Selection controls

- [~] **P0** `MuiSelect`
- [~] **P0** `MuiCheckbox`
- [~] **P0** `MuiRadio`
- [ ] **P0** `MuiMultiSelect`
- [ ] **P0** `MuiAutocomplete`
- [ ] **P0** `MuiAsyncAutocomplete`
- [ ] **P0** `MuiCheckboxGroup`
- [ ] **P0** `MuiRadioGroup`
- [ ] **P0** `MuiSwitch`
- [ ] **P1** `MuiToggleButton`
- [ ] **P1** `MuiToggleButtonGroup`
- [ ] **P1** `MuiCombobox`
- [ ] **P1** `MuiCreatableSelect`
- [ ] **P1** `MuiTreeSelect`
- [ ] **P1** `MuiTreeCheckbox`
- [ ] **P1** Grouped, disabled and nested options
- [ ] **P1** Select-all and clear-all for multi-selection
- [ ] **P1** Virtualized option lists for large datasets
- [ ] **P2** Transfer-list control

## 5. Date and time controls

- [~] **P0** `MuiDateField`
- [ ] **P0** `MuiTimeField`
- [ ] **P0** `MuiDateTimeField`
- [ ] **P1** `MuiDateRangeField`
- [ ] **P1** `MuiTimeRangeField`
- [ ] **P1** `MuiDateTimeRangeField`
- [ ] **P1** `MuiMonthField`
- [ ] **P1** `MuiYearField`
- [ ] **P0** Define one date adapter strategy and document it.
- [ ] **P0** Support min/max dates and disabled-date rules.
- [ ] **P0** Define storage values: ISO string, timestamp or adapter value.
- [ ] **P1** Support locale, timezone and 12/24-hour formats.
- [ ] **P1** Verify keyboard-only and mobile-picker behavior.

## 6. Numeric and measurement controls

- [ ] **P0** `MuiCurrencyField`
- [ ] **P0** `MuiPercentageField`
- [ ] **P1** `MuiSlider`
- [ ] **P1** `MuiRangeSlider`
- [ ] **P1** `MuiRating`
- [ ] **P1** Locale-aware grouping and decimal separators
- [ ] **P1** Currency-symbol placement and precision rules
- [ ] **P1** Unit suffixes and measurement normalization
- [ ] **P1** Min, max, step and clamping behavior
- [ ] **P1** Preserve numeric values instead of formatted strings

## 7. File and media controls

- [ ] **P1** `MuiFileUpload`
- [ ] **P1** `MuiMultiFileUpload`
- [ ] **P1** Drag-and-drop upload area
- [ ] **P1** File type, count and size validation
- [ ] **P1** Upload progress, retry and cancellation
- [ ] **P1** Image preview and removal
- [ ] **P1** Existing/server-file representation
- [ ] **P2** Camera/image capture
- [ ] **P2** Signature pad
- [ ] **P2** Document preview

## 8. Nested data and arrays

- [ ] **P0** `MuiObjectField` for nested objects.
- [ ] **P0** `MuiArrayField` with add, remove and reorder.
- [ ] **P0** Stable item keys independent of array indexes.
- [ ] **P0** Nested error summary and focus navigation.
- [ ] **P1** Minimum and maximum item constraints.
- [ ] **P1** Copy/duplicate array item.
- [ ] **P1** Collapsible array cards.
- [ ] **P1** Array table/grid renderer.
- [ ] **P1** Confirmation before destructive item removal.
- [ ] **P2** Virtualized large arrays.
- [ ] **P2** Drag-and-drop reordering with keyboard alternative.

## 9. Layout system

- [ ] **P0** Vertical and horizontal stacks.
- [ ] **P0** Responsive grid with schema-defined breakpoints.
- [ ] **P0** Sections, fieldsets and legends.
- [ ] **P0** Tabs and accordions.
- [ ] **P0** Card and panel containers.
- [ ] **P0** Conditional layout visibility.
- [ ] **P1** Stepper/wizard layout.
- [ ] **P1** Sticky form actions.
- [ ] **P1** Read-only summary layout.
- [ ] **P1** Custom layout registry.
- [ ] **P1** Prevent layout schema from containing MUI-specific Core types.
- [ ] **P2** Master/detail layout.

## 10. Data-source integration

- [ ] **P0** Render static option sources consistently.
- [ ] **P0** Connect select controls to Core async data sources.
- [ ] **P0** Display loading, empty and error states.
- [ ] **P0** Support retry without losing the current form value.
- [ ] **P0** Support debounced search and request cancellation.
- [ ] **P0** Support dependent parameters for cascading controls.
- [ ] **P0** Ignore stale responses after dependency changes.
- [ ] **P1** Support pagination, infinite scroll and load-more.
- [ ] **P1** Display cached/stale data without UI flicker.
- [ ] **P1** Normalize `{label, value, disabled, group, children}` options.
- [ ] **P1** Resolve an existing value not present on the current page.
- [ ] **P1** Allow custom option rendering safely.
- [ ] **P1** Expose request state and timings to DevTools.

## 11. Conditions, dependencies and permissions

- [ ] **P0** Map `visible`, `disabled`, `required` and `readOnly` results.
- [ ] **P0** Re-render only controls affected by a dependency change.
- [ ] **P0** Preserve or clear hidden values according to explicit policy.
- [ ] **P0** Cancel requests when a dependent field becomes inactive.
- [ ] **P0** Show runtime-required state consistently in label and validation.
- [ ] **P1** Support calculated display values.
- [ ] **P1** Support role/permission-driven hiding and read-only behavior.
- [ ] **P1** Prevent the UI renderer from becoming the security boundary.
- [ ] **P1** Expose active rules and dependency reasons to DevTools.

## 12. Validation and submission UX

- [ ] **P0** Validate on configured change, blur and submit modes.
- [ ] **P0** Display sync, async, field and form-level errors.
- [ ] **P0** Mark all invalid submitted fields as touched.
- [ ] **P0** Focus and scroll to the first invalid visible field.
- [ ] **P0** Disable or guard duplicate submissions.
- [ ] **P0** Show submitting state without destroying field values.
- [ ] **P0** Support server/API errors mapped to fields.
- [ ] **P1** Form error summary with accessible field links.
- [ ] **P1** Pending async-validation indicator.
- [ ] **P1** Warning and informational messages in addition to errors.
- [ ] **P1** Success state and reset/keep-values policies.

## 13. Accessibility requirements

- [ ] **P0** Target WCAG 2.2 AA.
- [ ] **P0** Every input has a programmatic label.
- [ ] **P0** Errors and descriptions use correct ARIA associations.
- [ ] **P0** All controls are usable with keyboard only.
- [ ] **P0** Visible focus indicators meet contrast requirements.
- [ ] **P0** Required, invalid, disabled and read-only states are announced.
- [ ] **P0** Dynamic errors use appropriate live-region behavior.
- [ ] **P0** Hidden controls are removed from focus order.
- [ ] **P1** Automated checks with axe-core.
- [ ] **P1** Screen-reader verification with NVDA and VoiceOver.
- [ ] **P1** High-contrast and 200% zoom testing.
- [ ] **P1** Reduced-motion support.
- [ ] **P1** RTL keyboard and layout testing.

## 14. Theming, branding and localization

- [ ] **P0** Use MUI theme tokens—no hard-coded visual values.
- [ ] **P0** Support light and dark color schemes.
- [ ] **P0** Allow theme `defaultProps`, variants and style overrides.
- [ ] **P0** Support application-level and field-level `sx`/slot overrides.
- [ ] **P1** Provide density and shape presets.
- [ ] **P1** Support RTL layouts.
- [ ] **P1** Translate built-in labels, actions, errors and empty states.
- [ ] **P1** Locale-aware numbers, currencies, dates and times.
- [ ] **P1** Avoid English strings inside component implementations.
- [ ] **P2** Provide an enterprise theme starter.

## 15. Performance

- [ ] **P0** Subscribe each field only to the state it consumes.
- [ ] **P0** Prevent complete-form rerenders on individual keystrokes.
- [ ] **P0** Memoize normalized options and renderer lookup.
- [ ] **P0** Benchmark forms containing 100, 500 and 1,000 fields.
- [ ] **P0** Measure initial render, keystroke latency and condition updates.
- [ ] **P1** Virtualize very large option lists and arrays.
- [ ] **P1** Lazy-load advanced controls and date adapters.
- [ ] **P1** Detect unnecessary renders in DevTools.
- [ ] **P1** Define and enforce bundle-size budgets.
- [ ] **P1** Publish comparisons using reproducible benchmark code.

## 16. Testing requirements

- [ ] **P0** Unit tests for every value adapter and normalizer.
- [ ] **P0** Component tests for value, blur, error and disabled behavior.
- [ ] **P0** Registry and custom-renderer tests.
- [ ] **P0** Conditions and dependent-data-source integration tests.
- [ ] **P0** Empty-submit test: all required errors appear immediately.
- [ ] **P0** Submission test: `onSubmit` runs only for valid data.
- [ ] **P0** Nested-field and array-path tests.
- [ ] **P1** Accessibility tests with Testing Library and axe-core.
- [ ] **P1** Playwright keyboard and screen-size coverage.
- [ ] **P1** Visual regression tests for light, dark, RTL and error states.
- [ ] **P1** React Strict Mode tests.
- [ ] **P1** Supported React/MUI version matrix in CI.

## 17. Playground and documentation

- [ ] **P0** Basic dynamic form demo.
- [ ] **P0** All stable field controls demo.
- [ ] **P0** Validation and empty-submit demo.
- [ ] **P0** Conditions and dependency demo.
- [ ] **P0** Cascading async data-source demo.
- [ ] **P0** Nested object and array demo.
- [ ] **P0** Live values/errors/touched/dirty panel.
- [ ] **P1** Business-rule and request trace panels.
- [ ] **P1** Accessibility examples.
- [ ] **P1** Custom-control registration guide.
- [ ] **P1** Theming and localization guides.
- [ ] **P1** Migration examples from manual MUI forms and RHF.
- [ ] **P1** API reference for every schema property.

## 18. Release engineering

- [ ] **P0** Document supported React and MUI versions.
- [ ] **P0** Adopt semantic versioning and automated changelogs.
- [ ] **P0** Validate package exports in an external test application.
- [ ] **P0** Add prerelease channels such as `next` and `beta`.
- [ ] **P0** Add npm provenance, 2FA and protected publishing.
- [ ] **P0** Run dependency and license scanning.
- [ ] **P1** Define deprecation policy and migration guides.
- [ ] **P1** Maintain a compatibility matrix for Core/React/MUI packages.
- [ ] **P1** Establish issue templates and support expectations.

## Senior delivery plan

### Delivery principles

- Work in vertical slices: a control is not complete until it is registered, rendered, accessible, tested, and documented.
- Keep Core schema contracts framework-neutral; MUI-specific props belong in the MUI adapter or registry metadata.
- Keep the package releasable at the end of every phase: typecheck, tests, and build must pass.
- Do not expand the stable control set until the shared field infrastructure is in place.

### Phase 0 - Recover the engineering baseline [x]

**Goal:** Make `@dynamic-forms/mui` safe to change and establish a trustworthy CI signal.

**Deliverables**

- Resolve every current TypeScript and build error, including Core imports, registry variance, and strict-null issues.
- Remove duplicate/dead type declarations and development `console.log` output.
- Align package metadata with `@dynamic-forms/react`: correct peer dependencies, `sideEffects: false`, and verified exports.
- Add Vitest plus a DOM environment and baseline tests for package exports, registry lookup, renderer failures, and one rendered field.

**Exit gate:** `pnpm --filter @dynamic-forms/mui typecheck`, `test`, and `build` pass from a clean checkout.

**Verified 2026-08-22:** typecheck passed; 3 baseline tests passed; ESM, CJS, and TypeScript declaration build passed.

### Phase 1 - Renderer foundation and field contract [x]

**Goal:** Establish the abstraction every MUI control uses.

**Deliverables**

- Define generic `MuiFieldProps<TField, TValue>` and a typed registry API with default-plus-override composition.
- Build `MuiFieldShell`, error/live-region behavior, label/description IDs, loading state, and ref forwarding.
- Implement a schema-driven `MuiFormRenderer` supporting fields, groups, and baseline layouts.
- Add development diagnostics and an error boundary with actionable unknown-control errors.

**Exit gate:** Renderer and registry integration tests pass; a custom control can be registered without replacing defaults.

**Verified 2026-08-22:** typecheck, 6 baseline/renderer tests, and production build pass.

### Phase 2 - P0 input and selection controls

**Goal:** Deliver a consistent, production-quality baseline set of common controls.

**Deliverables**

- Complete text, textarea, email, URL, password, number, integer, decimal, and hidden fields.
- Complete select, multi-select, autocomplete, async autocomplete, checkbox, checkbox group, radio, radio group, and switch.
- Normalize values, blur/touched behavior, disabled/read-only behavior, error rendering, and focus handling through the shared shell.
- Implement static options, disabled options, grouped options where supported, and predictable empty values.

**Exit gate:** Each stable control meets the per-control definition of done and has component tests for value, blur, disabled, validation, and reset behavior.

### Phase 3 - Dates, numeric values, and value adapters

**Goal:** Make value formats explicit and prevent UI formatting from leaking into form state.

**Deliverables**

- Select and document a single MUI date-adapter strategy; move date libraries to appropriate peer/optional-peer dependencies.
- Complete date, time, and date-time fields with documented ISO storage and min/max/disabled-date support.
- Complete currency and percentage controls; add slider, range slider, and rating where their Core schema support is stable.
- Add pure, unit-tested adapters for number parsing, currency formatting, percentages, dates, and null/empty-value normalization.

**Exit gate:** Locale/date adapter tests pass and form state contains the documented canonical values, never display-formatted strings.

### Phase 4 - Form behavior: conditions, dependencies, and data sources

**Goal:** Connect MUI rendering to the Core runtime without introducing global rerenders or stale UI.

**Deliverables**

- Map visible, disabled, required, and read-only conditions through the field shell.
- Implement explicit hidden-value policy and focus handling when active fields disappear.
- Integrate async data sources with loading, empty, error, retry, cancellation, debounced search, and dependent parameters.
- Add stale-response protection and per-field subscriptions to preserve render isolation.

**Exit gate:** Integration tests cover conditions, cascading controls, cancellation, retries, and unrelated-field render isolation.

### Phase 5 - Nested forms and layouts

**Goal:** Support real business forms with safe nested structures.

**Deliverables**

- Implement object and array renderers with stable item keys, add/remove/reorder, nested error navigation, and focus-on-error.
- Deliver semantic sections, fieldsets, responsive grid, stacks, cards, tabs, and accordions.
- Keep layout schema generic and place MUI layout implementations behind a renderer registry.

**Exit gate:** Nested object/array tests cover validation, reset, reorder, removal confirmation, and accessibility semantics.

### Phase 6 - Submission UX and accessibility baseline

**Goal:** Make P0 forms usable and robust under real submission flows.

**Deliverables**

- Support configured validation modes, async and server errors, submission state, duplicate-submit protection, and first-invalid focus/scroll.
- Add accessible error summary links, live error announcements, stable ARIA relationships, and keyboard-only navigation.
- Verify required, invalid, disabled, read-only, and hidden-field semantics against WCAG 2.2 AA expectations.
- Add automated accessibility checks with Testing Library and axe-core.

**Exit gate:** Empty-submit, valid-submit, server-error, keyboard, and axe tests pass for every stable control.

### Phase 7 - Theming, localization, performance, and developer experience

**Goal:** Make the adapter operable in enterprise applications at scale.

**Deliverables**

- Support MUI theme variants/defaultProps/style overrides, dark mode, density, `sx`/slot overrides, RTL, and translated built-in strings.
- Add render diagnostics, reproducible 100/500/1,000-field benchmarks, and bundle-size reporting/budgets.
- Lazy-load advanced controls and virtualize large option sets only after measurements demonstrate need.
- Build playground examples for all stable controls, validation, conditions, cascading sources, nested forms, and accessibility.

**Exit gate:** Performance budgets are documented and met; playground and API documentation cover every stable public capability.

### Phase 8 - Release hardening and v1 readiness

**Goal:** Ship a supportable package, not just a passing implementation.

**Deliverables**

- Add version-matrix CI, external consumer fixtures, ESM/CJS/type export verification, semantic-release/changelog workflow, and dependency/license scanning.
- Publish installation, migration, troubleshooting, accessibility, custom-control, theming, and localization documentation.
- Establish deprecation policy, prerelease channels, provenance/2FA/protected publishing, issue templates, and support expectations.
- Complete manual screen-reader, high-contrast, zoom, mobile picker, and visual-regression validation.

**Exit gate:** Every P0 checklist item and the v1 release gate are complete; two external consumer applications validate the published package.

### Deferred after v1

Keep P2 controls and features outside the v1 critical path: rich text/code editors, capture/signature/document workflows, transfer lists, virtualized arrays, master-detail layouts, and advanced DevTools traces.
## Enterprise definition of done for every control

A control is complete only when all applicable items below pass:

- [ ] Strongly typed schema, props and value
- [ ] Registered in the default registry
- [ ] Correct initial, controlled and reset values
- [ ] Touched, dirty and blur behavior
- [ ] Required and custom validation
- [ ] Error and helper-text rendering
- [ ] Visible, disabled, required and read-only conditions
- [ ] Dependency updates without unrelated rerenders
- [ ] Loading, empty, failure and retry behavior when data-backed
- [ ] Keyboard and screen-reader accessibility
- [ ] Light, dark, RTL and responsive presentation
- [ ] Localization and value formatting
- [ ] Unit, component, integration and visual tests
- [ ] Playground example and API documentation
- [ ] Tree-shaking and bundle-size verification

## v1 release gate

Do not label `@dynamic-forms/mui` as stable v1 until:

- [ ] All **P0** items are complete.
- [ ] At least 15 production-quality controls are available.
- [ ] Nested objects and arrays work reliably.
- [ ] Conditions and cascading API-backed fields are demonstrated.
- [ ] Required-field errors appear on an empty submission.
- [ ] Accessibility checks pass for every stable control.
- [ ] A 500-field benchmark stays within the documented performance budget.
- [ ] Public APIs and schemas have migration/versioning rules.
- [ ] Documentation includes installation, tutorials, API reference and troubleshooting.
- [ ] Two external example applications consume the published packages successfully.
## Audit â€” 2026-08-22

The package contains initial implementations for the eight controls marked **in progress** above, plus several later-roadmap controls. None are marked complete and verified yet because `pnpm --filter @dynamic-forms/mui typecheck` and `build` currently fail, and the package has no test files. The blocked errors include invalid Core type imports, registry type incompatibilities, and strict-null/type issues in several controls.
