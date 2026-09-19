# FormSchema

## Core 1.0 schema pipeline

Core validates, normalizes, and compiles authoring schemas before runtime use. Persisted schemas should use `schemaVersion: 1` with `defineFormSchema()`, or `definePortableFormSchema()` when every value must be JSON-safe.

Compiled schemas expose readonly indexes for fields, dependencies, conditions, datasources, validation, and defaults. `createFormRuntime()` carries `InferFormValues<typeof schema>` into typed runtime paths automatically.

Field IDs are optional opaque builder identities. When supplied, they must be trimmed, non-empty, and unique across the complete form. Runtime value paths and field IDs are independent.

Concrete and template array-item references are not accepted in persisted conditions, dependencies, or datasource parameters until Core supports per-item runtime compilation. Referencing the array container itself is supported.

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-form-engine/core` 0.1.0

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
import type { FormSchema } from '@dynamic-form-engine/core';

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
