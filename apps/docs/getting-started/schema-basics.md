# Schema basics

A form schema has a stable `id` and an ordered `fields` array. Each field needs a unique `name` path and a renderer `type`.

```ts verify
import type { FormSchema } from '@dynamic-forms/core';

export const accountSchema: FormSchema = {
  id: 'account',
  version: '1.0.0',
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    },
    {
      name: 'teamSize',
      type: 'integer',
      label: 'Team size',
      validation: { min: 1, max: 10_000 },
    },
  ],
};
```

## Field properties

`label`, `placeholder`, and `description` provide presentation hints. `options` supplies choice values. `config` contains control-specific behavior. `validation` contains portable constraints such as required values, lengths, limits, patterns, and collection rules.

Field names are state paths. Keep them stable after deployment because submissions, drafts, errors, conditions, and analytics may depend on them.

## Defaults and values

You can place `defaultValue` on a field, but the quickstart supplies a typed `defaultValues` object to `FormProvider`. Prefer one clear source of defaults per workflow. Submitted values are keyed by field name.

## Validation and errors

Schema validators store a message for each failing field. HTML controls expose that message through visible and accessible error output. Validation mode controls field timing; form submission always validates the full schema before invoking the submit handler.

Compare field `type` values with the [React HTML package guide](../packages/react-html.md).
