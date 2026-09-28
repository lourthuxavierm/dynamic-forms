# FormStore

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc

`FormStore<T>` is the framework-independent state engine. It owns values and
field state, runs validation and submission, emits [events](./events.md), and
notifies subscribers. `FormRuntime` wraps a store with conditions,
dependencies, and data sources; the store can also be used on its own.

## Create and update

```ts verify
import { FormStore } from '@dynamic-form-engine/core';

type Values = { profile: { name: string }; tags: string[] };
const store = new FormStore<Values>({ profile: { name: 'Ada' }, tags: ['math'] });

store.setValue('profile.name', 'Grace', { shouldTouch: true }); // typed path and value
store.setValue('tags[0]', 'computing');                         // array index
store.batch(() => {
  store.setValue('profile.name', 'Katherine');
  store.setError('profile.name', 'Already registered');
});

const name: string = store.getValue('profile.name');
console.log(name, store.getState().dirty);
```

## Operations

| Area | Methods | Contract |
| --- | --- | --- |
| Read | `getState`, `getValues`, `getValue` | Return frozen snapshots. `getValue` accepts typed paths or `dynamicPath()` runtime paths. |
| Values | `setValue`, `setValues` | No-op when `Object.is(previous, next)`. `setValues` applies top-level keys of `Partial<T>` as one update. |
| Field state | `setError`, `clearError`, `setTouched` | `setError` makes the form invalid; `clearError` derives `valid` from the remaining errors. |
| Form flags | `setDisabled`, `setLoading`, `setSubmitting` | Notify only when the flag changes. |
| Transactions | `batch` | See [transactions](#transactions). |
| Validation | `validate`, `cancelValidation` | See the [validation contract](./validation.md). |
| Submission | `submit` | See [submission](./submission.md). |
| Reset | `reset`, `resetField` | See [reset](#reset). |
| Observation | `on`, `subscribe`, `subscribeSelector`, `subscribeToValue`, `subscribeToError`, `subscribeToTouched`, `subscribeToDirty`, `subscribeToField` | Every method returns an idempotent cleanup function. See [subscriptions](./subscriptions.md). |

`SetValueOptions`:

- `shouldTouch` marks the path touched in the same update.
- `shouldDirty: false` leaves dirty state unchanged.
- `shouldValidate` is a hint for integrations. The store never validates
  implicitly.

## Paths and field state

Paths use dots for object keys and either dots or brackets for array indexes.
`items[0].name` and `items.0.name` are the same field: reads, writes, `dirty`,
`touched`, `errors`, focused subscriptions, and `resetField` all resolve
equivalent spellings to one entry. The state record keys an entry by the
spelling of its most recent write, so read field state through the store's
methods and subscriptions rather than by indexing the record with a
hard-coded spelling.

A path is dirty while its value differs from the initial value by `Object.is`.
Restoring the initial value removes the dirty entry.

## Immutability

Initial values are copied with `structuredClone`. `values`, `errors`,
`touched`, `dirty`, and the state object are deep-frozen. Updates copy only the
containers on the changed path, so unchanged branches keep their identity
between snapshots. Do not store host objects that cannot be cloned, such as
DOM nodes or class instances with private state.

## Transactions

`batch(operation)` runs `operation` as one transaction. Inside it, mutations
are visible immediately through `getState()`, but events are consolidated
(one `valueChange` per path, with the earliest `previousValue`) and subscribers
are notified once, after the outermost batch completes. Nested batches join the
outer transaction. An async operation holds the transaction open until its
promise settles.

There is **no rollback**: if `operation` throws, mutations already applied stay
applied and the transaction is committed before the error is rethrown.

Event handlers that mutate the store during a transaction (as conditions and
dependencies do) are drained in the same transaction. More than
`FormStoreOptions.maxLifecycleIterations` (default 10,000) drained events throws
to stop runaway mutation loops.

## Reset

`reset(newInitialValues?, options?)` cancels in-flight validation, optionally
replaces the initial values, and restores values, errors, touched, and dirty
state unless `keepValues`, `keepErrors`, `keepTouched`, or `keepDirty` is set.
It clears `submitting` and `loading`, emits `reset`, and notifies every
subscriber once.

`resetField(path)` restores one path, including all of its descendants, to its
initial value and removes that path's (and its descendants') errors, touched,
and dirty entries.

## Options

| Option | Default | Purpose |
| --- | --- | --- |
| `maxLifecycleIterations` | `10000` | Upper bound on events drained in one transaction. Must be a positive integer. |
| `onAsyncError` | none | Receives non-abort validation errors of the current request. |
