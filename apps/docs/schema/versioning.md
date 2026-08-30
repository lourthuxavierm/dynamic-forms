# Schema versioning

- Status: Application-owned contract
- Owner: Schema owners and Core maintainers
- Last verified: 2026-08-26
- Applies to: `FormSchema.version` in Core 0.1.0

`FormSchema.version` is an optional opaque string. Core stores it but does not
parse, compare, negotiate, or migrate schema versions.

## Recommended policy

Choose one documented convention, such as semantic versions or immutable
revision identifiers, and keep it independent from package versions.

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const loanApplicationV2: FormSchema = {
  id: 'loan-application',
  version: '2.0.0',
  fields: [{ name: 'requestedAmount', type: 'currency' }],
};
```

## Breaking schema changes

Examples include renaming paths, changing stored value types, removing required
options, changing nested shapes, or altering conditional behavior that affects
submitted values. Visual-only renderer layout changes may be nonbreaking for
data but still require usability and accessibility review.

## Enterprise workflow

1. Store schema ID, version, and submitted-data version together.
2. Validate a schema before activation.
3. Test migration against representative saved drafts.
4. Keep migration functions in trusted application code.
5. Support rollback to the previous schema and renderer combination.
6. Audit who approved and activated each version.

## Limitation

Dynamic Forms does not currently ship a migration registry or compatibility
negotiator. Do not assume a changed `version` transforms existing values.
