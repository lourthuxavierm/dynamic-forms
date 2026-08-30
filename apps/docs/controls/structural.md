# Structural fields

- Status: Documented
- Owner: Core, React, and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: Stable `object` and `array` field types

Object and array are stable structural fields, not part of the 42 leaf-control
count.

## Object

An `object` recursively renders child fields and stores a plain nested object.
Child paths use dot notation, such as `profile.firstName`.

## Array

An `array` stores a plain array. Object item paths use indexes such as
`contacts[0].email`. Primitive items use the item path and require
`metadata: { primitiveItems: true }` or a single child named `$value`.

```ts verify
import type { FormSchema } from '@dynamic-form-engine/core';

export const structuralSchema: FormSchema = {
  id: 'structural-fields',
  fields: [
    { name: 'profile', type: 'object', fields: [
      { name: 'firstName', type: 'text' },
      { name: 'lastName', type: 'text' },
    ] },
    { name: 'contacts', type: 'array', validation: { minItems: 1, maxItems: 5 }, fields: [
      { name: 'email', type: 'email', validation: { required: true } },
    ] },
  ],
};
```

Arrays support add, duplicate, remove, reorder, constraints, and stable render
identity. Internal row keys are never submitted. Duplicate creates a deep clone
so rows do not share mutable values.

Custom windowing through `arrayItemsRenderer` must preserve keyboard
reachability, reveal invalid off-screen rows, and keep all values in the shared
store.
