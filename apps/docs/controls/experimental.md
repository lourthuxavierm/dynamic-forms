# Experimental and deferred controls

- Status: Experimental and Planned
- Owner: React HTML maintainers
- Last verified: 2026-08-26
- Applies to: React HTML 0.1.0

## Experimental registry extensions

| Type | Status | Reason |
| --- | --- | --- |
| `searchable-select` | Experimental | Registered compatibility extension outside `V1_HTML_FIELD_TYPES`. |
| `tree-checkbox` | Experimental | Registered compatibility extension outside the v1 stability guarantee. |

Experimental types are implemented but may change without the v1 migration
guarantees applied to the stable tuple. Applications must isolate their usage
and test upgrades.

## Deferred Core field type

Core's `FieldType` includes standalone `toggle-button`, but the default React
HTML registry does not register it. `toggle-button-group` is stable; the two
names are not interchangeable.

Attempting to render an unregistered type produces an actionable unknown-control
error. A consumer may supply a registry override, but that custom implementation
owns its value, accessibility, styling, and migration contracts.

## Planned renderers

Standalone Native HTML/DOM and Angular HTML have no control implementations in
this repository. The stable React HTML inventory must not be presented as
evidence that those renderers exist.

## Promotion requirements

Before an experimental or custom type enters the stable inventory it needs a
public value/configuration contract, automated behavior and accessibility tests,
reference documentation, compatibility review, and migration guidance.
