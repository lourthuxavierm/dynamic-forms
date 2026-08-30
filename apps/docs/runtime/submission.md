# Submission runtime

- Status: Documented
- Owner: Core, React, and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: Core, React, and React HTML 0.1.0

## Core submission

`FormStore.submit(handler, validator?)` returns `undefined` without running the
handler when the store is already submitting, disabled, or fails validation.
On success it sets submitting, awaits the handler, emits `submit`, and restores
submitting in `finally`.

```ts verify
import { FormStore } from '@lourthuxavierm/dynamic-forms-core';

const store = new FormStore({ email: 'ada@example.com' });
const result = await store.submit(
  async (values) => ({ accepted: values.email }),
  () => ({}),
);

console.log(result);
```

Thrown errors propagate after submitting state is restored. A failed validator
updates errors and emits `validate`; it does not emit `submit`.

## React provider submission

`FormProvider.submit()` uses `FormProvider.onSubmit`, schema validation, invalid
submit handling, focus coordination, and optional error callback.

## React HTML submission

Normal `<HtmlForm>` submission prevents browser navigation, calls provider
`validateForm`, and then invokes `HtmlForm.onSubmit` with current readonly values.
It does not call `FormProvider.submit()` in the current implementation.

## Enterprise boundary

Client submission does not authenticate, authorize, persist, deduplicate, or
audit a request. Applications own pending UI, idempotency, server validation,
field-error mapping, retries, recovery, and navigation.
