# Schema validation

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-forms/core` 0.1.0

Schema validation and value validation are separate operations.

## Validate schema structure

Use `validateSchema` before accepting generated, stored, or remote definitions:

```ts verify
import { validateSchema, type FormSchema } from '@dynamic-forms/core';

const schema: FormSchema = {
  id: 'quantity',
  fields: [
    { name: 'quantity', type: 'number', validation: { required: true, min: 1, max: 100 } },
  ],
};

const result = validateSchema(schema);
if (!result.valid) console.error(result.errors);
```

It detects invalid child structure, sibling duplicates, invalid ranges and
patterns, duplicate option values, unknown condition/dependency paths,
self-dependencies, and incomplete data-source configurations.

## Built-in value rules

| Rule | Applies when value has compatible shape |
| --- | --- |
| `required` | Rejects `undefined`, `null`, `false`, blank strings, empty arrays, and `NaN`. |
| `minLength`, `maxLength` | String length. |
| `min`, `max` | Finite numeric conversion. |
| `pattern` | JavaScript regular expression against strings. |
| `multipleOf` | Numeric multiple with floating-point tolerance. |
| `minItems`, `maxItems` | Array length. |
| `uniqueItems` | Array uniqueness based on `JSON.stringify` values. |

Only the first issue for each field path is placed in the form error record.
Fields hidden by `visibleWhen` are skipped. `requiredWhen` adds required behavior
when its condition evaluates true.

## Security boundary

Value validation improves interaction but cannot authorize a request. Validate
schemas against an application policy and validate submitted values again on a
trusted server.
