# Form state

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc and React

## State shape

| Property | Meaning |
| --- | --- |
| `values` | Immutable current value tree. |
| `errors` | First current error message by field path. |
| `touched` | Boolean flags by path. |
| `dirty` | Paths whose current value differs from the initial value by `Object.is`. Equivalent array spellings share one entry. |
| `valid` | Whether the current error record is empty after store validation/error operations. |
| `submitting` | A store submission handler is running. |
| `disabled` | Form-level disabled state used by store submission gating and integrations. |
| `loading` | Application/integration-controlled loading state. Cleared by `reset()`. |
| `validating` | A current validation request is running. |
| `validationError` | The error thrown by the current validator, if it failed with anything other than an abort. Cleared when validation starts again or is cancelled. |

## React selection

```tsx verify
import { useFormState } from '@dynamic-form-engine/react';

export function SubmitStatus() {
  const submitting = useFormState((state) => state.submitting);
  const valid = useFormState((state) => state.valid);
  return <output>{submitting ? 'Submitting' : valid ? 'Ready' : 'Needs attention'}</output>;
}
```

Selectors should return stable values where possible. Returning a new object on
every snapshot can cause unnecessary React updates or violate external-store
snapshot expectations.

## Validity limitation

`valid` reflects the store's current error record. It is not proof that a form
has been validated against the latest schema or accepted by a server.
