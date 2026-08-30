# Field metadata

- Status: Implemented extension point
- Owner: Core maintainers and application schema owners
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-core` 0.1.0

`FieldSchema.metadata` is an open `Record<string, unknown>` for application or
renderer extensions. Core stores the object but assigns it no automatic
validation or runtime behavior.

## Example

```ts verify
import type { FieldSchema } from '@lourthuxavierm/dynamic-forms-core';

export const employeeId: FieldSchema = {
  name: 'employeeId',
  type: 'text',
  label: 'Employee ID',
  metadata: {
    analyticsName: 'employee_id',
    permission: 'employee.write',
    helpArticle: 'employee-identifiers',
  },
};
```

## Governance

- Namespace metadata keys for shared libraries to avoid collisions.
- Publish and version a separate metadata schema.
- Validate remote metadata before consuming it.
- Do not place secrets, authorization decisions, components, or executable code
  in transportable metadata.
- Treat permissions in metadata as display hints only; enforce authorization on
  a trusted server.

Metadata is not a substitute for a first-class Core property. Promote a concept
to the public schema only when it needs portable, tested semantics across
integrations.
