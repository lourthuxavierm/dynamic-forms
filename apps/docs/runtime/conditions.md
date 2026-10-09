# Conditional state

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc and React

`ConditionController` calculates each field's `visible`, `disabled`,
`required`, and `readOnly` state from current values and schema conditions,
and applies hidden-value policies. `FormRuntime` creates and disposes one for
you.

## State rules

| Flag | Value |
| --- | --- |
| `visible` | `visibleWhen` result, otherwise `true` |
| `disabled` | `disabled: true`, otherwise `disabledWhen` result, otherwise `false` |
| `required` | `validation.required`, otherwise `requiredWhen` result, otherwise `false` |
| `readOnly` | `readOnly: true`, otherwise `readOnlyWhen` result, otherwise `false` |

## Condition language

A condition is a rule `{ field, operator, value? }` or a group
`{ and?, or?, not? }`. Groups combine their parts with AND; an empty group is
`true`. `field` is an absolute value path. Schemas may not reference indexed
array paths such as `items.0.code`.

| Operator | True when the value at `field` … |
| --- | --- |
| `equals` / `notEquals` | is / is not `=== value` |
| `exists` / `notExists` | is not / is `undefined` or `null` |
| `contains` | is an array that includes `value`, or a string that includes `String(value)` |
| `greaterThan` / `lessThan` | compares numerically after `Number()` conversion |

Condition state is computed per schema field, not per array item.

## Re-evaluation

1. On construction every field is evaluated.
2. On each `valueChange`, only fields whose conditions reference the changed
   path, one of its ancestors, or one of its descendants are re-evaluated.
   Replacing `profile` re-evaluates a rule on `profile.address.country`.
3. On `reset`, every field is re-evaluated and hidden-value policies are
   re-applied to fields that are hidden.
4. Listeners run only when a field's state actually changes. Each change bumps
   a per-field and a global version (`getVersion(path?)`).

Subscribe with `subscribe(listener)`, `subscribe(path, listener)`, or
`subscribeSelector(selector, listener, equality?)`; each returns a cleanup.

## Hidden values

| Policy | Behavior when the field becomes hidden |
| --- | --- |
| `preserve` or omitted | Keep the stored value. |
| `clear` | Set the path to `undefined` (skipped if already `undefined`). |
| `reset` | Restore the initial value and clear the field's error, touched, and dirty state. |

Policy actions run after the evaluation pass. Inside `FormRuntime` they join
the mutation's transaction, so subscribers see a single notification with the
settled state. With `FormRuntime` diagnostics enabled, policy writes are
recorded with `origin: 'hiddenValuePolicy'`.

## Validation interaction

`createFormValidator` skips fields whose `visibleWhen` is false and applies
`requiredWhen`. Disabled and read-only are interaction contracts for renderers:
they do not erase values and do not skip validation. See the
[validation contract](./validation.md).

## Explaining state

`explainCondition(condition, values)` and
`FormRuntime.explainFieldState(path)` report which rule decided a flag. See
[diagnostics](./diagnostics.md).

## Lifecycle

`dispose()` removes the controller's store subscriptions and its listeners.
`FormRuntime` and `FormProvider` own this for the controllers they create.
