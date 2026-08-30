# React custom controls

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: `@lourthuxavierm/dynamic-forms-react` 0.1.0

Register a React component with `registerReactField` and a Core
`FieldRegistry`, or pass an explicit render callback to `DynamicField`.
`FieldComponentProps<T>` supplies field schema, path, current value, mutations,
error/touch/dirty state, conditional state, validation state, and accessibility
identifiers.

A custom control must preserve the Core value contract, call `setTouched` at
the correct interaction boundary, respect disabled/read-only/required state,
apply the supplied accessibility properties, and avoid owning duplicate form
state. Registration belongs to the headless adapter; HTML-specific registries
are documented under [React HTML customization](../react-html/custom-controls.md).
