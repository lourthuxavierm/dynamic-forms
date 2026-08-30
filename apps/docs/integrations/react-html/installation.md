# React HTML installation and complete example

- Status: Implemented
- Owner: React HTML maintainers
- Last verified: 2026-08-27
- Applies to: React 18 or 19

```sh
pnpm add @dynamic-form-engine/core @dynamic-form-engine/react @dynamic-form-engine/react-html react react-dom
```

Import `@dynamic-form-engine/react-html/styles.css` once when using the default style
layer. Wrap `HtmlForm` in `FormProvider`; the provider owns runtime lifecycle
and the HTML form owns browser-control rendering and its `onSubmit(values)`
callback.

The runnable application at `apps/react-html-playground` exercises all 42
stable leaf controls plus object and array fields, validation, reset, file-safe
output, and submitted values. Its typecheck and production build are Phase 8
release evidence.
