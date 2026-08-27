# Angular validation

- Status: Experimental integration; Core contract implemented
- Owner: Angular and Core maintainers
- Last verified: 2026-08-27
- Applies to: `DynamicFormFacade.validate` and `submit`

`validate()` runs Core's schema validator and updates Core error state.
`submit()` delegates to `FormStore.submit` with the same validator, so invalid
values do not invoke the configured submit handler. Field signals expose current
errors for renderer or design-system presentation.

The headless adapter does not translate Core errors into Angular Validator
objects except through future Forms-bridge work.
