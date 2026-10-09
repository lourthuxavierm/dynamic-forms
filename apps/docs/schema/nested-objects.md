# Nested objects

- Status: Documented
- Owner: Core and renderer maintainers
- Last verified: 2026-09-28
- Applies to: Core 1.0.0-rc and React HTML

An object field groups child fields into a nested value. It must define at least
one child field.

## Schema and value

```ts verify
import type { FormSchema, InferFormValues } from '@dynamic-form-engine/core';

export const customerSchema = {
  id: 'customer',
  fields: [
    {
      name: 'address',
      type: 'object',
      label: 'Address',
      fields: [
        { name: 'street', type: 'text', validation: { required: true } },
        { name: 'city', type: 'text', validation: { required: true } },
      ],
    },
  ],
} as const satisfies FormSchema;

export const customerValues: InferFormValues<typeof customerSchema> = {
  address: { street: '10 Main Street', city: 'Pune' },
};
```

Child paths use dot notation, such as `address.street`. Child names cannot
contain path separators. Conditions, dependencies, errors, touched state, and
dirty state use these paths.

## Validation

The form validator validates the object field and recursively validates its
children. A non-object field that defines children is schema-invalid. Object
values should remain plain structured-clone-compatible data.

## Value inference

`InferFormValues<typeof schema>` infers the value shape of a literal schema,
including nested objects and arrays, and supports custom field value maps.
Validate external values at runtime rather than relying only on compile-time
inference.

`InferSchemaType` is **deprecated**: use `InferFormValues` instead. It will be
removed in 2.0.0; see [package major versions](../migration/package-major-versions.md).
