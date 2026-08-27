# DynamicForm and DynamicField

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-forms/react` 0.1.0

`DynamicField` resolves a schema field and passes renderer-neutral
`FieldComponentProps` to an explicit render callback or a component registered
in Core's `FieldRegistry`. It owns subscription and derived field state, not
markup or design.

`DynamicForm` renders registered fields, recursively handles object and array
schema nodes, includes `FormErrorSummary` by default, and delegates submission
to `FormProvider.submit()`. Its controls come entirely from the supplied
registry.

React HTML uses the same headless field contract but supplies browser-native
implementations through `HtmlFieldRenderer`. Do not treat `DynamicForm` and
`HtmlForm` as aliases: [submission behavior differs](../../runtime/submission.md).
