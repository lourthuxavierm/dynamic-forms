# FormProvider and context

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-forms/react` 0.1.0

`FormProvider<TValues>` supplies a `FormStore`, field registry, optional schema,
validation mode, condition/dependency controllers, submission actions, and
lifecycle callbacks. It may create an internal store from `defaultValues` or
receive the `store` returned by `useForm`.

## Provider properties

| Property | Purpose |
| --- | --- |
| `store`, `registry` | Supply controlled runtime objects |
| `schema`, `defaultValues` | Establish schema behavior and initial values |
| `validationMode` | `onChange`, `onBlur`, `onSubmit`, or `manual`; default `onBlur` |
| `onSubmit`, `onError` | Provider submission lifecycle |
| `onChange`, `onValidate` | Observe Core events |
| `onInvalidSubmit`, `focusOnInvalidSubmit` | Invalid-submit behavior |
| `onDataSourceRefresh` | Handle dependency-driven refresh requests |

`useFormContext` exposes the resolved store, registry, schema, validation,
submit, and reset actions. It throws outside a provider. Prefer one provider per
independent form; nested providers are diagnosed in development.
