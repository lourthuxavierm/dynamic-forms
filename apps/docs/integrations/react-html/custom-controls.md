# React HTML registries and custom controls

- Status: Implemented
- Owner: React HTML maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-form-engine/react-html` 0.1.0

`createHtmlRegistry`, `mergeHtmlRegistries`, and `createDefaultHtmlRegistry`
produce immutable registry objects. An override value replaces a control;
`undefined` removes it. `HtmlForm.registry` accepts overrides while preserving
the default registry for other types.

Custom components consume the headless `FieldComponentProps` contract and must
use `HtmlFieldShell` or provide equivalent labels, descriptions, errors, state,
and focus hooks. `createLazyHtmlRegistry` supplies opt-in `React.lazy`
overrides for costly control groups; `HtmlFieldRenderer` provides Suspense and
an error boundary.
