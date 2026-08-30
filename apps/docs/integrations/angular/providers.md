# Angular providers and lifecycle

- Status: Experimental
- Owner: Angular maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-form-engine/angular` 0.1.0

`provideDynamicForms` registers application defaults. `provideDynamicForm`
creates an isolated `DynamicFormFacade` for a component scope, and
`injectDynamicForm` or `injectDynamicField` reads that scope. The DI factory
registers facade disposal with `DestroyRef`.

Applications may also call `createDynamicForm` directly when the form is owned
as a component property. Directly created facades must be disposed in the
component lifecycle. Use one facade per independent form.
