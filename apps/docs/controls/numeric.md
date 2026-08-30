# Numeric controls

- Status: Documented
- Owner: React HTML maintainers
- Last verified: 2026-08-26
- Applies to: React HTML v1 controls

| Type | Stored value | Main contract |
| --- | --- | --- |
| `number` | Finite number or `undefined` | Uses native numeric input with configured min, max, step, and precision. |
| `integer` | Integer or `undefined` | Decimal input is not retained as an integer value. |
| `decimal` | Finite number or `undefined` | Supports decimal step and optional precision. |

`year` also stores a number but belongs to the stable date/time group and is
documented on the [date and time page](./date-time.md).

## Schema example

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const numericSchema: FormSchema = {
  id: 'numeric-controls',
  fields: [
    { name: 'quantity', type: 'number', config: { min: 0, max: 100, step: 0.5 } },
    { name: 'employees', type: 'integer', validation: { min: 1 } },
    { name: 'measurement', type: 'decimal', config: { step: 0.01, precision: 2 } },
  ],
};
```

## Editing contract

Empty text stores `undefined`. Invalid intermediate text does not become a
valid stored number. Numeric schema validation converts compatible values with
`Number`, but applications should preserve numeric values in state instead of
submitting formatted strings.

## Validation and accessibility

Use `min`, `max`, and `multipleOf` for value validation; renderer `step` affects
native input behavior. Labels and errors use the shared field shell. Do not rely
only on color or spinner buttons to communicate constraints.
