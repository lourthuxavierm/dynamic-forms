# Conditional state

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

`ConditionController` calculates visible, disabled, required, and read-only state
from current values and schema conditions.

## Processing

1. Collect every field and referenced condition path.
2. Calculate initial state.
3. Subscribe to `valueChange` and recalculate only affected fields.
4. Recalculate all fields on reset.
5. Notify global and field-specific condition subscribers only when state changes.

## Hidden values

| Policy | Behavior when the field becomes hidden |
| --- | --- |
| `preserve` or omitted | Keep the current stored value. |
| `clear` | Set the field path to `undefined`. |
| `reset` | Restore the field's initial value and clear its field state. |

Clear/reset actions are deferred until the current condition calculation pass
finishes. They can emit additional value events and condition recalculations.

## Validation interaction

Invisible fields are skipped by the Core form validator. Conditional required
state combines with static `validation.required`. Disabled and read-only state
are renderer interaction contracts and do not automatically erase values.

## Lifecycle

Dispose the controller to remove store event subscriptions and condition
listeners. `FormProvider` owns this lifecycle for its schema.
