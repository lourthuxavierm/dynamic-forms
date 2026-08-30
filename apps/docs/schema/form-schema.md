# FormSchema

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-core` 0.1.0

## Signature

```ts
interface FormSchema {
  id: string;
  fields: readonly FieldSchema[];
  version?: string;
}
```

## Properties

| Property | Required | Runtime meaning |
| --- | ---: | --- |
| `id` | Yes | Application identifier for the form definition. Core does not enforce uniqueness across schemas. |
| `fields` | Yes | Ordered top-level field definitions. The array is read as a schema contract and should be treated as immutable. |
| `version` | No | Opaque application-owned version label. Core does not parse, compare, or migrate it. |

## Example

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const accountSchema: FormSchema = {
  id: 'account',
  version: '2026-08-26',
  fields: [
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'active', type: 'switch', label: 'Active' },
  ],
};
```

## Limitations

Core schema validation does not currently reject an empty `id`, enforce a
version format, or require at least one top-level field. Applications needing
those rules must add governance validation before accepting a schema.
