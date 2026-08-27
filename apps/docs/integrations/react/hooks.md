# React hooks and subscriptions

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-forms/react` 0.1.0

| API | Subscription or responsibility |
| --- | --- |
| `useForm` | Creates a stable typed store and registry |
| `useField` | Field value, error, touch/dirty state, validation and mutations |
| `useFieldState` | Derived field state including conditions |
| `useWatch` | One value or a list of values |
| `useFormState` | Selected form state |
| `useFormActions` | Stable mutations, validation, submit, and reset actions |
| `useFormStore` | Full state for an explicitly supplied store |
| `useFormEvent` | Core event subscription with unmount cleanup |
| `useDataSource` | Data, loading, errors, search, paging, refresh, and cancel |
| `useFieldArray` | Stable array item operations |
| `useSection`, `useWizard` | Headless disclosure and step state |

Hooks use `useSyncExternalStore` where they subscribe to Core. Prefer the
narrowest hook or selector that supplies the required state; broad form-state
subscriptions rerender for more changes.
