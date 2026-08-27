# Form lifecycle

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

## Provider lifecycle

```text
Create FormStore from default values
  -> expose immutable initial state
  -> create condition and dependency controllers when schema exists
  -> subscribe React consumers
  -> process value and form actions
  -> dispose controllers and subscriptions on unmount/schema change
```

`FormProvider` creates one internal store per mounted provider unless a stable
external store is supplied. It creates condition and dependency controllers for
the current schema and disposes them when their effect is replaced.

## Value-change sequence

For `FormStore.setValue`:

```text
Compare previous value
  -> create and freeze next values/state
  -> emit valueChange
  -> emit fieldChange
  -> notify global and affected-path subscribers
```

Condition processing subscribes to `valueChange`, so a condition may recalculate
during that event. Dependency processing subscribes to store state and runs when
store listeners are notified. Avoid depending on callback registration order
between independent subscribers.

## Validation sequence

```text
Run validator
  -> replace error record
  -> update valid flag
  -> emit validate
  -> notify all subscribers
```

## Submission sequence

```text
Reject when already submitting or disabled
  -> validate when validator exists
  -> stop on errors
  -> set submitting true
  -> await handler
  -> emit submit on success
  -> set submitting false in finally
```

Thrown submit errors propagate after `submitting` is restored.
