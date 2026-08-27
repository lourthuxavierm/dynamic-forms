# Conditions

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-forms/core` 0.1.0

Conditions express framework-neutral decisions from current form values.

## Operators

| Operator | Behavior |
| --- | --- |
| `equals`, `notEquals` | Strict equality or inequality. |
| `exists`, `notExists` | Checks only `undefined` and `null`. Empty strings still exist. |
| `contains` | Uses array `includes` or string substring matching. |
| `greaterThan`, `lessThan` | Converts both sides with `Number`. |

## Field condition

```ts verify
import type { FormSchema } from '@dynamic-forms/core';

export const businessSchema: FormSchema = {
  id: 'business',
  fields: [
    { name: 'customerType', type: 'select', options: [
      { label: 'Individual', value: 'individual' },
      { label: 'Business', value: 'business' },
    ] },
    {
      name: 'companyName',
      type: 'text',
      visibleWhen: { field: 'customerType', operator: 'equals', value: 'business' },
      requiredWhen: { field: 'customerType', operator: 'equals', value: 'business' },
      hiddenValuePolicy: 'clear',
    },
  ],
};
```

## Condition groups

Groups may contain `and`, `or`, and `not`. Present groups are combined: all
`and` items must match, at least one `or` item must match, and `not` must fail.
An omitted group does not restrict the result.

## Available field effects

- `visibleWhen`
- `disabledWhen`
- `requiredWhen`
- `readOnlyWhen`

Renderers decide how conditional state is presented. Core's form validator skips
invisible fields and evaluates conditional required behavior.
