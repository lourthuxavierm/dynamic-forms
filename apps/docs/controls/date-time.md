# Date and time controls

- Status: Documented
- Owner: React HTML maintainers
- Last verified: 2026-08-26
- Applies to: React HTML v1 controls

## Stored values

| Type | Stored format |
| --- | --- |
| `date` | `YYYY-MM-DD` |
| `time` | `HH:mm` or `HH:mm:ss` |
| `datetime` | `YYYY-MM-DDTHH:mm` or `YYYY-MM-DDTHH:mm:ss` |
| `date-range` | Two date strings with optional empty endpoints |
| `time-range` | Two time strings with optional empty endpoints |
| `datetime-range` | Two local datetime strings with optional empty endpoints |
| `month` | `YYYY-MM` |
| `year` | Number or `undefined` |

Values are local calendar/time strings without an implicit timezone. Local
datetime normalization rejects `Z` and explicit UTC offsets.

## Schema example

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const temporalSchema: FormSchema = {
  id: 'temporal-controls',
  fields: [
    { name: 'startDate', type: 'date', config: { minDate: '2026-01-01', maxDate: '2026-12-31' } },
    { name: 'startTime', type: 'time', config: { step: 300 } },
    { name: 'appointment', type: 'datetime' },
    { name: 'vacation', type: 'date-range' },
    { name: 'shift', type: 'time-range' },
    { name: 'window', type: 'datetime-range' },
    { name: 'billingMonth', type: 'month' },
    { name: 'foundedYear', type: 'year', config: { min: 1800, max: 2100 } },
  ],
};
```

## Range behavior

Range endpoints constrain one another. Crossing an endpoint collapses the range
to the newly selected value instead of storing an inverted interval. Empty
endpoints use `undefined` inside the two-item range contract.

## Native picker differences

Picker appearance, locale presentation, seconds visibility, and shortcuts vary
across browsers and operating systems. Applications must not require a visual
calendar affordance. Submitted formats remain stable despite presentation
differences.

Converting a local value to UTC is an application decision requiring an explicit
timezone policy.

## Accessibility

Each scalar input and range endpoint requires a programmatic label. Constraints
and errors must be available as text and connected to the relevant input.
Keyboard and manual-entry behavior must remain usable when the browser does not
show a picker. Test representative controls across supported browsers because
native date/time accessibility and presentation vary by platform.
