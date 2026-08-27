# Angular dynamic form facade

- Status: Experimental
- Owner: Angular and Core maintainers
- Last verified: 2026-08-27
- Applies to: `DynamicFormFacade`

The facade owns a Core `FormStore`, `ConditionController`, and
`DependencyController`. It projects values, state, validity, and submission
state through readonly signals and exposes Core-backed commands for setting
values, validation, submission, reset, and field reset.

`createDynamicForm` accepts a schema, default values, optional existing store,
and optional Core submit handler. Core remains the source of truth; consumers
cannot mutate the projected signals directly.
