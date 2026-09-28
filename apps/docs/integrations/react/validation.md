# React validation and errors

- Status: Implemented
- Owner: React and Core maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/react` 1.0.0-rc (React 18 and 19)

Core owns validators and error state. React connects validation to lifecycle
through `validationMode`, `useField().validate()`, `validateForm`, and provider
submission. Stale field-validation runs cannot overwrite a newer run.

`FormErrorSummary` renders links to invalid fields and may focus when errors
change. After an invalid submission the provider focuses the first control, in
document order, whose `name` matches an error path (either array spelling) and
that is enabled and not inside a hidden, inert, or disabled container.
`LiveRegion` supports polite or assertive application announcements.

Errors thrown by an `onSubmit` handler or by a validator during
`validateForm()`/submission are passed to `onError` and rethrown; aborted
validations are not reported.
Applications should distinguish validation failures, which resolve without a
submit result, from submission exceptions.

Pass `formValidator` to compose an application validator after schema
validation. Both receive the request's abort signal. Errors from the application
validator take precedence for the same field path and are used by both
`validateForm` and submission. This is the
integration point for `createZodFormValidator`.
