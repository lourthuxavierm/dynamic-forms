# Native HTML v1 control reference

The HTML package provides a React-first renderer over framework-neutral Dynamic
Forms schemas and state. Angular can implement the same contracts later; no
React or DOM types are part of the Core schema.

## Stable inventory

The public V1_HTML_FIELD_TYPES tuple is the source of truth for the 42 stable
leaf controls. V1HtmlFieldType is its TypeScript union.

| Group | Types | Stored value |
| --- | --- | --- |
| Text | text, textarea, password, email, url | Unformatted string |
| Numeric | number, integer, decimal, currency, percentage, slider, rating, year | Number or undefined |
| Hidden | hidden | Schema value |
| Selection | select, autocomplete, async-autocomplete, radio, radio-group, switch, tree-select | Typed option value or boolean |
| Multi-selection | multi-select, checkbox-group, toggle-button-group | Typed option-value array |
| Temporal | date, time, datetime, month | Normalized local string |
| Temporal ranges | date-range, time-range, datetime-range | Start/end local strings |
| Numeric range | range-slider | Ordered numeric pair |
| Formatted text | phone, otp, pin, mask | Raw, unformatted string |
| Files and media | file, multi-file, camera | File, File array, or empty value |
| Signature | signature | Renderer-defined exported value |
| Preview | document-preview | File or previewable source |

Object and array are stable structural field types, not leaf controls. Arrays
support add, duplicate, remove, reorder, nested fields, constraints, and stable
render identity without adding internal keys to submitted values.

## Common behavior

Every stable control receives the same FieldComponentProps contract from the
React adapter. It supplies value and state, setters, validation, accessibility
IDs, conditions, and disabled, required, and read-only flags. Controls do not
read or mutate the FormStore directly.

Common markup exposes df-field and df-field-control classes, state modifier
classes, and data attributes. Labels, descriptions, errors, required state, and
validating announcements are connected with generated IDs and ARIA attributes.

## Configuration

- Numeric and year fields use min, max, step, and optional precision.
- Choices can be searchable and configure async debounce behavior.
- Temporal controls use local-value semantics without implicit UTC conversion.
- OTP and PIN use length, numeric, and autocomplete settings.
- Masks keep display formatting separate from the stored raw value.
- File controls use accept, count, size, and preview constraints.
- Arrays use item constraints and reorder or duplicate capabilities.

## Experimental extensions

EXPERIMENTAL_HTML_FIELD_TYPES contains searchable-select and tree-checkbox.
They remain available for compatibility but are not covered by the v1 stability
guarantee. Core's standalone toggle-button is also outside this inventory.
