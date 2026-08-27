# Nested objects

- Status: Documented
- Owner: Core and renderer maintainers
- Last verified: 2026-08-26
- Applies to: Core and React HTML 0.1.0

An object field groups child fields into a nested value. It must define at least
one child field.

## Schema and value

```ts verify
import type { FormSchema, InferSchemaType } from '@dynamic-forms/core';

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

export const customerValues: InferSchemaType<typeof customerSchema> = {
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

## Inference limitation

`InferSchemaType` provides useful object shape inference for literal schemas,
but several leaf types intentionally resolve to broad types in the current
implementation. Validate external values at runtime rather than relying only on
compile-time inference.
