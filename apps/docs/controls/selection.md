# Selection controls

- Status: Documented
- Owner: React HTML maintainers
- Last verified: 2026-08-26
- Applies to: React HTML v1 controls

## Value contracts

| Type | Stored value | Interaction |
| --- | --- | --- |
| `select` | Typed option value | Native single select. |
| `multi-select` | Typed option-value array | Native multiple select. |
| `autocomplete` | Typed option value | ARIA combobox with local filtering. |
| `async-autocomplete` | Typed option value | ARIA combobox with debounced data-source search. |
| `checkbox` | Boolean | Native checkbox. |
| `checkbox-group` | Typed option-value array | Native checkbox group. |
| `radio` | Typed option value | Native radio choice. |
| `radio-group` | Typed option value | Named native radio group. |
| `switch` | Boolean | Switch semantics; Space toggles. |
| `toggle-button-group` | Typed value or typed array | Buttons expose `aria-pressed`; multiple mode uses an array. |
| `tree-select` | Typed option value | Hierarchical options with native-select progressive enhancement. |

Typed values may be strings, numbers, or booleans. Do not stringify option
values at application boundaries unless that is the declared API contract.

## Schema example

```ts verify
import type { FormSchema } from '@dynamic-form-engine/core';

const options = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Operations', value: 'operations' },
] as const;

export const selectionSchema: FormSchema = {
  id: 'selection-controls',
  fields: [
    { name: 'department', type: 'select', options },
    { name: 'skills', type: 'multi-select', options },
    { name: 'search', type: 'autocomplete', options },
    { name: 'remote', type: 'async-autocomplete', dataSource: { type: 'static', options } },
    { name: 'enabled', type: 'checkbox' },
    { name: 'groups', type: 'checkbox-group', options },
    { name: 'primary', type: 'radio', options },
    { name: 'role', type: 'radio-group', options },
    { name: 'notifications', type: 'switch' },
    { name: 'views', type: 'toggle-button-group', options, config: { multiple: true } },
    { name: 'category', type: 'tree-select', options },
  ],
};
```

## Keyboard and accessibility

Native select, checkbox, and radio behavior is preserved. Autocomplete uses the
ARIA combobox/listbox pattern with arrow, Home, End, Enter, Escape, typing, and
Tab behavior. Toggle buttons expose pressed state. Tree indentation supplements
the accessible option label and must not be the only hierarchy cue.

## Limitations

Async data remains application-controlled and must handle cancellation, errors,
trust, and response validation. Disabled options cannot be selected. Duplicate
option values are schema-invalid after string conversion.
