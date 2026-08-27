# Angular HTML complete example

- Status: Implemented experimental playground
- Owner: Angular HTML and example maintainers
- Last verified: 2026-08-27
- Applies to: `apps/angular-html-playground`

The workspace playground runs Angular 22.1.3 with zoneless change detection. It
creates a typed facade, renders six representative fields through
`DynamicHtmlFormComponent`, validates required values, and displays immutable
submitted values.

Release verification typechecks the application and produces a substantive
production bundle. Browser smoke coverage verifies the heading, form labels,
validation, value entry, and submitted output.
