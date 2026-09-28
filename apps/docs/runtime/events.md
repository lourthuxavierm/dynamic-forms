# Form events

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc

## Event types

| Type | Emitted when | Fields and payload |
| --- | --- | --- |
| `valueChange` | A stored path changes | `field`, `value`, `previousValue`, `payload: { values }` |
| `fieldChange` | Immediately after `valueChange` for the same path | `field`, `value`, and `previousValue` for `setValue` |
| `validate` | The current validation request completes | `payload: { valid, errors, values }` |
| `submit` | A submit handler resolves | `payload: { values, result }` |
| `reset` | `reset()` installs new state | `payload: { values }` |

`resetField`, `setError`, `setTouched`, and form-flag changes notify
subscribers but do not emit events. `FormEventType` is an exhaustive union;
adding a member is a breaking change.

## Subscribe

```ts verify
import { FormStore } from '@dynamic-form-engine/core';

const store = new FormStore({ email: '' });
const unsubscribe = store.on('valueChange', (event) => {
  console.log(event.field, event.previousValue, event.value);
});

store.setValue('email', 'ada@example.com');
unsubscribe();
```

Listeners execute synchronously in registration order within an event type.
Unsubscribe when ownership ends. Event payloads can contain complete values; do
not send them to logs or analytics without classification and redaction.

## Ordering and transactions

- `valueChange` is emitted before `fieldChange` for a path.
- Outside a transaction, events are emitted synchronously as each mutation
  happens, then subscribers are notified.
- Inside `batch()` (and every `FormRuntime` mutation, which runs in an implicit
  transaction), events are queued and consolidated: one `valueChange` and one
  `fieldChange` per path, carrying the **latest** `value` and the **earliest**
  `previousValue`. When the outermost transaction completes, queued events are
  emitted; mutations made by event listeners (conditions, dependencies) join
  the same transaction and are drained until the state settles. Subscribers
  are notified once afterwards.
- `FormRuntime` also reports each emission as an `events` lifecycle phase; see
  [form lifecycle](./form-lifecycle.md).

Do not treat events from independent controllers or application listeners as
a distributed transaction boundary.
