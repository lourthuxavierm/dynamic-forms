# Submission runtime

- Status: Documented
- Owner: Core, React, and React HTML maintainers
- Last verified: 2026-09-28
- Applies to: Core, React, and React HTML 1.0.0-rc

## Core submission

`FormStore.submit(handler, validator?)` returns `undefined` without running the
handler when the store is already submitting, disabled, or fails validation.
On success it sets submitting, awaits the handler, emits `submit`, and restores
submitting in `finally`.

```ts verify
import { FormStore } from '@dynamic-form-engine/core';

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
submit handling, focus coordination, and optional error callback. Without an
`onSubmit`, it still validates and runs invalid-submit handling, then resolves
`undefined`.

## React HTML submission

Normal `<HtmlForm>` submission prevents browser navigation and ignores the event
while the form is disabled or already submitting. With `HtmlForm.onSubmit`, it
calls provider `validateForm` and then runs the handler through
`FormStore.submit`, so `submitting`, the `submit` event, and duplicate-submit
protection apply. It does not call `FormProvider.submit()` in that case. Without
`HtmlForm.onSubmit`, it delegates to `FormProvider.submit()`.

## Enterprise boundary

Client submission does not authenticate, authorize, persist, deduplicate, or
audit a request. Applications own pending UI, idempotency, server validation,
field-error mapping, retries, recovery, and navigation.
