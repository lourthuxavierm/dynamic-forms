# FormStore

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-core` 0.1.0

`FormStore<T>` is the framework-independent state engine.

## Create and update

```ts verify
import { FormStore } from '@lourthuxavierm/dynamic-forms-core';

const store = new FormStore({
  profile: { name: 'Ada' },
  tags: ['math'],
});

store.setValue('profile.name', 'Grace', { shouldTouch: true });
store.setValue('tags[0]', 'computing');
store.setValues({ profile: { name: 'Katherine' } });

console.log(store.getValue('profile.name'));
```

`setValue` accepts runtime paths, including array indexes. For a strongly typed
store, `setValues` accepts `Partial<T>` top-level keys rather than arbitrary
string path keys.

## Public operations

| Area | Methods |
| --- | --- |
| Read | `getState`, `getValues`, `getValue` |
| Values | `setValue`, `setValues` |
| Field state | `setError`, `clearError`, `setTouched` |
| Form flags | `setDisabled`, `setLoading`, `setSubmitting` |
| Workflow | `validate`, `submit`, `reset`, `resetField` |
| Observation | `on`, `subscribe`, `subscribeToField` |

`setError` makes the state invalid. `clearError` removes one error and derives
validity from the remaining error record. `setTouched` changes only touched
state and not the value.

## Immutability

Initial values are cloned with `structuredClone`. State, values, errors, touched,
and dirty objects are recursively frozen. Updates create new path containers.
Do not mutate snapshots or store host objects that cannot be safely cloned.

## No-op and batched updates

`setValue` returns when `Object.is(previous, next)` is true. `setValues` batches
changed paths into one global state notification and then notifies affected field
subscribers once each.

`SetValueOptions.shouldValidate` exists in the current type but `FormStore`
does not automatically run a validator from `setValue`; integrations control
validation timing.
