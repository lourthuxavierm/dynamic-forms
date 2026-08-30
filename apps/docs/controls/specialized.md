# Specialized controls

- Status: Documented
- Owner: React HTML maintainers
- Last verified: 2026-08-26
- Applies to: React HTML v1 controls

| Type | Stored value | Contract |
| --- | --- | --- |
| `currency` | Finite number or `undefined` | Currency symbols and grouping stay out of state. |
| `percentage` | Finite number or `undefined` | Percentage points: `12.5` means 12.5%, not 0.125. |
| `slider` | Number | Uses configured min, max, and step. |
| `range-slider` | Ordered two-number tuple | Endpoints remain minimum then maximum. |
| `rating` | Number | Bounded by configured maximum rating. |
| `phone` | Raw string | Preserves international prefix; display formatting is separate. |
| `otp` | Digit string | Configurable length; raw digits remain in state. |
| `pin` | Digit string | Segments use password inputs; raw digits remain in state. |
| `mask` | Accepted raw-character string | Display literals are not stored. |

The stable inventory contains nine specialized controls: currency, percentage,
slider, range-slider, rating, phone, OTP, PIN, and mask.

## Schema example

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const specializedSchema: FormSchema = {
  id: 'specialized-controls',
  fields: [
    { name: 'budget', type: 'currency', config: { currency: 'INR', locale: 'en-IN', precision: 2 } },
    { name: 'completion', type: 'percentage', config: { min: 0, max: 100 } },
    { name: 'score', type: 'slider', config: { min: 0, max: 100, step: 5 } },
    { name: 'range', type: 'range-slider', config: { min: 0, max: 100 } },
    { name: 'rating', type: 'rating', config: { maxRating: 5 } },
    { name: 'phone', type: 'phone' },
    { name: 'otp', type: 'otp', config: { length: 6, numeric: true } },
    { name: 'pin', type: 'pin', config: { length: 4, numeric: true } },
    { name: 'reference', type: 'mask', config: { mask: 'AA-0000' } },
  ],
};
```

## Formatting behavior

Currency and percentage controls show formatted output while unfocused and a
plain editable value while focused. Invalid intermediate numeric text does not
overwrite the last valid number. Mask tokens are `0` for digits, `A` for
letters, and `*` for alphanumeric characters.

## Security and accessibility

OTP and PIN fields are not authentication systems by themselves. Enforce expiry,
attempt limits, transport security, and server verification. Labels, group
semantics, keyboard access, and visible focus remain required for segmented and
button-like controls.
