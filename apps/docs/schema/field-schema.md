# FieldSchema

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-forms/core` 0.1.0

## Identity and display

| Property | Meaning |
| --- | --- |
| `name` | Required sibling-local name and value path segment. It cannot be empty or contain `.`, `[` or `]`. |
| `type` | Required built-in or custom type string. Renderer support is separate from Core validity. |
| `label` | Human-readable label; renderers may fall back to `name`. |
| `description` | Supporting text. |
| `placeholder` | Input hint where supported; it is not a label or default value. |
| `defaultValue` | Schema-supplied default value. Integration behavior determines how it is applied. |

## State and behavior

| Property | Meaning |
| --- | --- |
| `disabled` | Initial/static disabled intent. |
| `readOnly` | Initial/static read-only intent. |
| `visibleWhen` | Conditional visibility. |
| `disabledWhen` | Conditional disabled state. |
| `requiredWhen` | Conditional required validation. |
| `readOnlyWhen` | Conditional read-only state. |
| `hiddenValuePolicy` | `preserve`, `clear`, or `reset` while conditionally hidden. |
| `dependsOn` | Schema paths that trigger dependent processing. |
| `resetOnDependencyChange` | Reset the field when an observed dependency changes. |
| `dataSource` | Static, function, or URL option source. |

## Values and extension

| Property | Meaning |
| --- | --- |
| `options` | Typed selection options with optional disabled, group, and child values. |
| `config` | Framework-neutral built-in configuration or an open custom record. |
| `validation` | Built-in validation rules. |
| `fields` | Child fields; valid only for `object` and `array`. |
| `metadata` | Application-owned extension data with no automatic Core semantics. |

## Structural validation

Names must be unique among siblings. Object and array fields require at least
one child. Non-structural fields cannot define `fields`. Conditions and
dependencies must reference known schema paths; indexed array references are
normalized during schema validation.

## Custom types

`type` accepts arbitrary strings so applications can register custom fields.
`validateSchema` does not query a renderer registry. Validate renderer
compatibility separately before showing the form.
