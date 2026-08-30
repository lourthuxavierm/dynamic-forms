# React validation and errors

- Status: Implemented
- Owner: React and Core maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-form-engine/react` 0.1.0

Core owns validators and error state. React connects validation to lifecycle
through `validationMode`, `useField().validate()`, `validateForm`, and provider
submission. Stale field-validation runs cannot overwrite a newer run.

`FormErrorSummary` renders links to invalid fields and may focus when errors
change. Provider invalid submission can focus the first element whose `name`
matches the first error. `LiveRegion` supports polite or assertive application
announcements.

Errors thrown by an `onSubmit` handler are passed to `onError` and rethrown.
Applications should distinguish validation failures, which resolve without a
submit result, from submission exceptions.

Pass `formValidator` to compose an application validator after schema
validation. Errors from the application validator take precedence for the same
field path and are used by both `validateForm` and submission. This is the
integration point for `createZodFormValidator`.
