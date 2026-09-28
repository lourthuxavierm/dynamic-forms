# HtmlForm

- Status: Implemented
- Owner: React HTML maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/react-html` 1.0.0-rc

`HtmlForm` requires `FormProvider`. It resolves a schema from its prop or the
provider, merges registry and layout overrides, renders a native `<form
noValidate>`, and submits through the provider's validation and the store's
submission lifecycle.

| Property group | Properties |
| --- | --- |
| Content | `schema`, `children`, `submitLabel`, `onSubmit`, `onError`, `errorSummary` |
| Controls | `registry`, `arrayItemsRenderer` |
| Layout | `layout`, `layoutRegistry`, `tabsRenderer` |
| Presentation | `className`, `unstyled`, `colorScheme`, `density`, `dir` |

## Submission

On a native submit event, `HtmlForm` prevents navigation and then:

1. Does nothing while the form is disabled (`FormProvider disabled`) or a
   submission is already in progress, including during async validation, so
   double submits are ignored.
2. With `HtmlForm onSubmit`: validates through the provider (errors, error
   summary, focus on the first invalid control), then calls `onSubmit` with the
   current values through `FormStore.submit`. `submitting` is true while it
   runs, so controls are disabled by default (`disableWhileSubmitting`), and a
   `submit` event is emitted. Errors thrown by `onSubmit` go to `HtmlForm
   onError`, or `console.error` without it. It does not call `FormProvider.submit()`.
3. Without `HtmlForm onSubmit`: delegates to `FormProvider.submit()`, which
   validates and calls the provider's `onSubmit` (errors go to the provider's
   `onError`).

See the [submission reference](../../runtime/submission.md).
