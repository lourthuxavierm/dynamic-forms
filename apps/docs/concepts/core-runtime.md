# Core runtime

Status: Implemented and source-verified.

## Schema paths and state

Field names are dot paths such as `profile.email`; numeric array segments may use dots or brackets. `getByPath`, `setByPath`, and `deleteByPath` perform immutable path operations. `FormStore` deep-clones initial values and publishes frozen state containing values, errors, touched, dirty, validity, submitting, disabled, and loading.

```ts verify
import { FormStore, type FormValidator } from '@dynamic-forms/core';
type Values = Record<string, unknown> & { profile: { email: string } };
const store = new FormStore<Values>({ profile: { email: '' } });
const unsubscribe = store.subscribeToField('profile.email', () => undefined);
store.setValue('profile.email', 'ada@example.com', { shouldTouch: true });
const validate: FormValidator<Values> = async (values): Promise<Record<string, string>> => { if (values.profile.email) return {}; return { 'profile.email': 'Required' }; };
void store.validate(validate);
unsubscribe();
```

## Subscriptions, events, and errors

`subscribe` observes every state update; `subscribeToField` observes a path and affected parents. Both return cleanup functions. `on` listens for `valueChange`, `fieldChange`, `submit`, `reset`, or `validate`. Use `setError` and `clearError` for server or custom errors. `validate` replaces the error map; `submit` rejects duplicate/disabled submission, validates first, and always clears submitting state.

## Boundaries

Core has no React or renderer dependency. It does not render controls or transport server errors. State snapshots are immutable; update through store methods.
