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
- [x] **P0** Keep React and MUI as peer dependencies; the native v1 date strategy requires no date-library dependency.
- [x] **P0** Export ESM, CJS and TypeScript declarations.
- [~] **P0** Verify tree-shaking and prevent side effects. `sideEffects: false` is configured; consumer-level verification is still pending.
- [ ] **P0** Define consistent controlled/uncontrolled value behavior.
- [x] **P0** Add component-level error boundaries and development warnings.
- [x] **P1** Support registry extension without replacing default controls.
- [ ] **P1** Support lazy-loaded custom controls.
- [ ] **P1** Publish package-size and bundle-composition reports.

## 2. Shared field infrastructure

- [x] **P0** Create `MuiFieldShell` for label, required mark, helper text and errors.
- [x] **P0** Create `MuiFieldError` with stable `aria-describedby` IDs.
- [x] **P0** Create `MuiFieldLoading` and skeleton behavior.
- [ ] **P0** Create consistent empty, disabled and read-only presentations.
- [ ] **P0** Map Core metadata: touched, dirty, validating, loading and errors.
- [ ] **P0** Ensure hidden fields do not leave broken layout space.
- [ ] **P0** Standardize `onChange`, `onBlur` and value normalization.
- [x] **P0** Forward refs to the focusable input.
- [ ] **P0** Support autofocus and programmatic focus-on-error.
- [ ] **P1** Add prefix, suffix, adornment, tooltip and description slots.
- [ ] **P1** Add character counters and input-length feedback.
- [ ] **P1** Support compact, normal and comfortable density.
- [ ] **P1** Support component and slot-prop overrides.
- [ ] **P1** Add field-level render diagnostics for DevTools.

## 3. Core input controls

- [x] **P0** `MuiTextField`
- [x] **P0** `MuiNumberField`
- [x] **P0** `MuiTextarea`
- [x] **P0** `MuiUrlField`
- [x] **P0** `MuiEmailField`
- [x] **P0** `MuiPasswordField` with show/hide and password-manager support
- [x] **P0** `MuiIntegerField`
- [x] **P0** `MuiDecimalField`
- [x] **P0** `MuiHiddenField`
- [ ] **P1** `MuiPhoneField`
- [ ] **P1** `MuiMaskedField`
- [ ] **P1** `MuiOtpField`
- [ ] **P1** `MuiPinField`
- [ ] **P1** `MuiSearchField`
- [ ] **P2** `MuiRichTextField`
- [ ] **P2** `MuiCodeEditorField`

## 4. Selection controls

- [x] **P0** `MuiSelect`
- [x] **P0** `MuiCheckbox`
- [x] **P0** `MuiRadio`
- [x] **P0** `MuiMultiSelect`
- [x] **P0** `MuiAutocomplete`
- [x] **P0** `MuiAsyncAutocomplete`
- [x] **P0** `MuiCheckboxGroup`
- [x] **P0** `MuiRadioGroup`
- [x] **P0** `MuiSwitch`
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

- [x] **P0** `MuiDateField`
- [x] **P0** `MuiTimeField`
- [x] **P0** `MuiDateTimeField`
- [x] **P1** `MuiDateRangeField`
- [x] **P1** `MuiTimeRangeField`
- [x] **P1** `MuiDateTimeRangeField`
- [x] **P1** `MuiMonthField`
- [x] **P1** `MuiYearField`
- [x] **P0** Define one date adapter strategy and document it.
- [x] **P0** Support min/max dates and disabled-date rules.
- [x] **P0** Define storage values: ISO-compatible native strings; empty values are `undefined`.
- [ ] **P1** Support locale, timezone and 12/24-hour formats.
- [ ] **P1** Verify keyboard-only and mobile-picker behavior.

## 6. Numeric and measurement controls

- [x] **P0** `MuiCurrencyField`
- [x] **P0** `MuiPercentageField`
- [x] **P1** `MuiSlider`
- [x] **P1** `MuiRangeSlider`
- [x] **P1** `MuiRating`
- [x] **P1** Locale-aware grouping and decimal separators
- [x] **P1** Currency-symbol placement and precision rules
- [ ] **P1** Unit suffixes and measurement normalization
- [x] **P1** Min, max, step and clamping behavior
- [x] **P1** Preserve numeric values instead of formatted strings

## 7. File and media controls

- [x] **P1** `MuiFileUpload`
- [x] **P1** `MuiMultiFileUpload`
- [x] **P1** Drag-and-drop upload area
- [x] **P1** File type, count and size validation
- [x] **P1** Upload progress, retry and cancellation
- [x] **P1** Image preview and removal
- [x] **P1** Existing/server-file representation
- [x] **P2** Camera/image capture
- [x] **P2** Signature pad
- [x] **P2** Document preview

**Verified 2026-08-22:** File/media P1 and P2 complete. Camera capture, typed signature data, and sandboxed image/PDF preview are covered by the 40-test MUI suite. Upload transport, signature legal validity, and content security enforcement remain application/server responsibilities.

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

- [x] **P0** Render static option sources consistently.
- [x] **P0** Connect select controls to Core async data sources.
- [x] **P0** Display loading, empty and error states.
- [x] **P0** Support retry without losing the current form value.
- [x] **P0** Support debounced search and request cancellation.
- [x] **P0** Support dependent parameters for cascading controls.
- [x] **P0** Ignore stale responses after dependency changes.
- [ ] **P1** Support pagination, infinite scroll and load-more.
- [x] **P1** Display cached/stale data without UI flicker.
- [x] **P1** Normalize `{label, value, disabled, group, children}` options.
- [x] **P1** Resolve an existing value not present on the current page.
- [ ] **P1** Allow custom option rendering safely.
- [ ] **P1** Expose request state and timings to DevTools.

## 11. Conditions, dependencies and permissions

- [x] **P0** Map `visible`, `disabled`, `required` and `readOnly` results.
- [x] **P0** Re-render only controls affected by a dependency change.
- [x] **P0** Preserve, clear or reset hidden values according to explicit policy.
- [x] **P0** Cancel requests when a dependent field becomes inactive.
- [x] **P0** Show runtime-required state consistently in renderer props and labels.
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

- [x] **P0** Subscribe each field only to the state it consumes.
- [x] **P0** Prevent complete-form rerenders on individual keystrokes.
- [ ] **P0** Memoize normalized options and renderer lookup.
- [ ] **P0** Benchmark forms containing 100, 500 and 1,000 fields.
- [ ] **P0** Measure initial render, keystroke latency and condition updates.
- [ ] **P1** Virtualize very large option lists and arrays.
- [ ] **P1** Lazy-load advanced controls and date adapters.
- [ ] **P1** Detect unnecessary renders in DevTools.
- [ ] **P1** Define and enforce bundle-size budgets.
- [ ] **P1** Publish comparisons using reproducible benchmark code.

## 16. Testing requirements

- [x] **P0** Unit tests for every implemented value adapter and normalizer.
- [ ] **P0** Component tests for value, blur, error and disabled behavior.
- [ ] **P0** Registry and custom-renderer tests.
- [x] **P0** Conditions and dependent-data-source integration tests.
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

## Recommended implementation order

### Milestone A — Stable renderer foundation

1. Shared field contract and shell
2. Registry and renderer
3. Text, number, textarea, select, checkbox, radio and date
4. Submit validation and focus-on-error
5. Accessibility baseline
6. Unit and integration tests

### Milestone B — Enterprise form essentials

1. Email, password, integer, decimal and hidden inputs
2. Multi-select, autocomplete, checkbox group, radio group and switch
3. Nested objects and arrays
4. Responsive layouts and sections
5. Async data-source states and cascading selections
6. Conditions and permissions

### Milestone C — Production hardening

1. Date/time completeness
2. Currency, percentage, file upload and advanced selections
3. Dark mode, RTL and localization
4. Performance benchmarks
5. Visual regression and accessibility verification
6. Complete documentation and playground

### Milestone D — Advanced controls

1. Tree controls and virtualized datasets
2. Array grid, rich text, code editor and signature
3. Advanced layout renderers
4. Deep DevTools integration

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
