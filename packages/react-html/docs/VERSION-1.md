# Native HTML v1 implementation status

## Contract

Native HTML v1 guarantees 42 leaf controls through the exported
V1_HTML_FIELD_TYPES tuple and V1HtmlFieldType union. Object and array are stable
structural types and are not included in the control count.

The renderer is React-first. Schema, configuration, state, validation,
conditions, dependencies, events, and data-source contracts remain
framework-neutral so another renderer, including Angular, can consume them.

## Implemented and verified

- [x] Immutable default registry, custom registration, override, removal, lazy
  registration, and actionable unknown-control errors
- [x] Field and form renderers with field-level error isolation
- [x] Shared labels, descriptions, errors, required markers, generated IDs,
  ARIA relationships, and stable styling/state hooks
- [x] Disabled, read-only, required, hidden, loading, touched, dirty, reset,
  programmatic update, programmatic error, and submit behavior
- [x] Fine-grained field subscriptions with unrelated-field render isolation
- [x] Conditions, dependency recalculation, validation modes, and data sources
  supplied by the Core and React contracts
- [x] Recursive object and array rendering, nested paths, collection errors,
  add, duplicate, remove, reorder, constraints, stable identity, and windowing
- [x] Native layouts, optional stylesheet, color schemes, density, RTL,
  reduced-motion, forced-color, and visible-focus behavior
- [x] Automated accessibility coverage for representative simple and complex
  controls, error summary, invalid focus, groups, comboboxes, and tabs
- [x] Render isolation, 500-field render, and windowed 1,000-item array checks
- [x] No third-party UI framework, runtime CSS-in-JS, or renderer-specific Core
  dependency

## Stable 42-control inventory

### Core inputs: 9

- [x] text
- [x] textarea
- [x] password
- [x] email
- [x] url
- [x] number
- [x] integer
- [x] decimal
- [x] hidden

### Selection: 11

- [x] select
- [x] multi-select
- [x] autocomplete
- [x] async-autocomplete
- [x] checkbox
- [x] checkbox-group
- [x] radio
- [x] radio-group
- [x] switch
- [x] toggle-button-group
- [x] tree-select

### Date and time: 8

- [x] date
- [x] time
- [x] datetime
- [x] date-range
- [x] time-range
- [x] datetime-range
- [x] month
- [x] year

### Specialized: 9

- [x] currency
- [x] percentage
- [x] slider
- [x] range-slider
- [x] rating
- [x] phone
- [x] otp
- [x] pin
- [x] mask

### File and media: 5

- [x] file
- [x] multi-file
- [x] camera
- [x] signature
- [x] document-preview

## Value contracts

- Numeric controls store numbers or undefined when empty.
- Temporal controls store normalized local strings without implicit UTC
  conversion.
- Range controls store explicit ordered endpoints.
- Multi-value controls preserve typed option values in arrays.
- Phone, OTP, PIN, and mask controls separate display formatting from raw
  stored values.
- React file controls store File objects; event and inspection helpers use
  privacy-safe metadata snapshots.
- Structural values remain plain nested objects and arrays; render keys are not
  submitted.

See CONTROL-REFERENCE.md and the specialized, temporal, file/media, structural,
accessibility, styling, and performance documents in this directory.

## Experimental and deferred

- searchable-select and tree-checkbox remain compatibility extensions and are
  explicitly outside the v1 guarantee.
- Core's standalone toggle-button is outside the Native HTML v1 inventory.
- An Angular renderer is deferred; the contracts it needs are framework-neutral.
- Manual multi-browser screen-reader certification remains a release-process
  gate rather than an automated package-test claim.
- Playground, DevTools UI, and release publication are tracked outside this
  controls package.

## Definition of done

The controls package can be called v1 stable when its tests, typecheck, build,
style contract, package-boundary check, documentation verification, and
performance script pass, followed by the manual accessibility release review.
