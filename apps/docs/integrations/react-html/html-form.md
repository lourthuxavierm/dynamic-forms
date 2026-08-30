# HtmlForm

- Status: Implemented
- Owner: React HTML maintainers
- Last verified: 2026-08-27
- Applies to: `@lourthuxavierm/dynamic-forms-react-html` 0.1.0

`HtmlForm` requires `FormProvider`. It resolves a schema from its prop or the
provider, merges registry and layout overrides, renders a native `<form
noValidate>`, validates through provider context, and passes immutable current
values to its own `onSubmit` callback.

| Property group | Properties |
| --- | --- |
| Content | `schema`, `children`, `submitLabel`, `onSubmit`, `errorSummary` |
| Controls | `registry`, `arrayItemsRenderer` |
| Layout | `layout`, `layoutRegistry`, `tabsRenderer` |
| Presentation | `className`, `unstyled`, `colorScheme`, `density`, `dir` |

Important: `HtmlForm` validates through the provider but does not call `FormProvider.submit()`.
Put the normal React HTML submission handler on `HtmlForm`; see the
[submission reference](../../runtime/submission.md).
