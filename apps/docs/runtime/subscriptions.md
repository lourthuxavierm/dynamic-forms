# Subscriptions

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

## Core subscriptions

- `subscribe(listener)` observes every notified state change.
- `subscribeToField(path, listener)` observes an exact path and affected parent
  paths.
- `setValues` batches global notification and deduplicates field listeners.
- `reset` and validation notify all field subscribers.

Always call the returned unsubscribe function.

## React subscriptions

| Hook | Scope |
| --- | --- |
| `useFormStore(store)` | Complete state snapshot for an explicit store |
| `useFormState(selector)` | Selected form state under the provider |
| `useWatch(path)` | One value path |
| `useWatch(paths)` | Several value paths |
| `useFieldState(path)` | Field and conditional state |

```tsx verify
import { useWatch } from '@dynamic-form-engine/react';

export function CountrySummary() {
  const country = useWatch<string>('address.country');
  return <output>{country || 'No country selected'}</output>;
}
```

## Performance guidance

Prefer the narrowest subscription that answers the UI question. Do not subscribe
every control to full form state. Keep selector results referentially stable and
avoid creating changing path arrays on every render.

Subscriptions are synchronous notifications, not durable event storage. Use a
separate audited system for persistence or analytics.
