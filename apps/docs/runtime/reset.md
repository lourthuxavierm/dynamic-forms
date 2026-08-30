# Reset behavior

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

## Complete reset

`reset(newInitialValues?, options?)` may replace the cloned initial value tree,
then restores values and clears errors, touched, dirty, submitting, and loading
unless retention options apply.

| Option | Retained state |
| --- | --- |
| `keepValues` | Current values |
| `keepErrors` | Errors and corresponding valid flag |
| `keepTouched` | Touched map |
| `keepDirty` | Dirty map |

Reset emits `reset` before notifying all state and field subscribers. Condition
controllers recalculate all fields during that event and enforce hidden clear or
reset policy.

## Field reset

`resetField(path)` restores the initial path and removes that path from errors,
touched, and dirty. It notifies affected path subscribers but does not emit the
form-level `reset` event.

```ts verify
import { FormStore } from '@lourthuxavierm/dynamic-forms-core';

const store = new FormStore({ name: 'Ada', active: true });
store.setValue('name', 'Grace', { shouldTouch: true });
store.setError('name', 'Review this value');
store.resetField('name');

store.reset({ name: 'Lin', active: false }, { keepTouched: true });
```

Reset is a client-state operation. Confirm separately before using it to discard
unsaved user work in an application UI.
