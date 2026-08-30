# Form events

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-core` 0.1.0

## Event types

| Type | Emitted when | Main payload |
| --- | --- | --- |
| `valueChange` | A stored path changes | Field, value, previous value, and current values payload |
| `fieldChange` | After `valueChange` for a changed path | Field, value, and previous value where supplied |
| `validate` | Store validation completes | Valid flag, errors, and values |
| `submit` | A store submit handler resolves | Values and handler result |
| `reset` | Complete reset state is installed | Reset values |

## Subscribe

```ts verify
import { FormStore } from '@lourthuxavierm/dynamic-forms-core';

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

## Ordering boundary

Core guarantees that `valueChange` is emitted before `fieldChange` for a path.
State subscribers are notified afterward. Do not treat events from independent
controllers or application listeners as a distributed transaction boundary.
