# Array fields

- Status: Documented
- Owner: Core, React, and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: Core, React, and React HTML 0.1.0

An array field describes a collection of objects with a shared child schema. It
must define at least one child field.

## Example

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const contactsSchema: FormSchema = {
  id: 'contacts',
  fields: [
    {
      name: 'contacts',
      type: 'array',
      label: 'Contacts',
      validation: { minItems: 1, maxItems: 5, uniqueItems: true },
      config: { minItems: 1, maxItems: 5, allowDuplicate: false, allowReorder: true },
      fields: [
        { name: 'name', type: 'text', validation: { required: true } },
        { name: 'email', type: 'email', validation: { required: true } },
      ],
    },
  ],
};
```

## Paths and values

Submitted values are plain arrays of objects. Runtime paths use indexes, such as
`contacts[0].email`. Renderer keys used to preserve UI identity are not part of
submitted data.

## Validation and configuration

`validation.minItems`, `maxItems`, and `uniqueItems` validate stored values.
Array configuration expresses renderer operations such as duplication and
reordering. Keep validation and UI constraints aligned; Core does not
automatically reconcile conflicting values across those two objects.

`uniqueItems` currently compares `JSON.stringify` output. Applications with
domain-specific identity should add a dedicated validator or server rule.

## Operational guidance

Use stable item identity in renderers, validate indexed server errors carefully,
and apply practical size limits. Large collections may require windowing, but
windowing must not remove values from the store or accessibility tree without a
documented interaction model.
