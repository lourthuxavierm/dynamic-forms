# FormProvider and context

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/react` 1.0.0-rc (React 18 and 19)

`FormProvider<TValues>` supplies a `FormStore`, field registry, optional schema,
validation mode, Core condition and dependency controllers, stable actions, and
lifecycle callbacks.

```tsx verify
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { DynamicField, FormProvider } from '@dynamic-form-engine/react';

const schema: FormSchema = { id: 'profile', fields: [{ name: 'name', type: 'text', validation: { required: true } }] };
const store = new FormStore({ name: '' });

export function ProfileForm({ locked }: { locked: boolean }) {
  return (
    <FormProvider store={store} schema={schema} disabled={locked} readOnly={locked}
      onSubmit={(values) => fetch('/profile', { method: 'POST', body: JSON.stringify(values) })}
      onError={(error) => console.error(error)}
      onEvent={(event) => console.debug(event.type, event.field)}>
      <DynamicField name="name" render={({ name, value, setValue, disabled, readOnly }) => (
        <input name={name} value={String(value ?? '')} disabled={disabled} readOnly={readOnly}
          onChange={(event) => setValue(event.target.value)} />
      )} />
    </FormProvider>
  );
}
```

## Store ownership

| Pattern | Behavior |
| --- | --- |
| `store={…}` (for example from `useForm`) | Controlled: the provider uses the store as-is and never replaces it. |
| `defaultValues={…}` only | The provider creates one store on first render and owns it. Later `defaultValues` changes are ignored; call `reset(values)` to replace values. |

## Provider properties

| Property | Purpose |
| --- | --- |
| `store`, `registry` | Controlled runtime objects |
| `schema`, `defaultValues` | Schema behavior and initial values |
| `validationMode` | `onChange`, `onBlur`, `onSubmit`, or `manual`; default `onBlur` |
| `formValidator` | Application validator (for example Zod) composed after schema validation. It receives the abort signal, also decides field-level validation for each field, and its errors for fields hidden by `visibleWhen` are ignored |
| `validateHiddenFields` | Keep `formValidator` errors for hidden fields; default `false` |
| `onSubmit`, `onError` | Submission; `onError` receives errors from `onSubmit` and from validators, never aborts. Without `onSubmit`, `submit()` still validates and runs invalid-submit handling |
| `onChange`, `onValidate`, `onReset`, `onEvent` | Core events; `onEvent` receives every event type |
| `onInvalidSubmit`, `focusOnInvalidSubmit` | Invalid-submit callback and focus of the first invalid control (default `true`) |
| `disabled` | Form-level disabled, synchronized to `store.setDisabled`; disabled forms do not submit |
| `readOnly` | Form-level read-only applied to every `DynamicField` |
| `disableWhileSubmitting` | Disable field controls while submitting; default `true` |
| `onDataSourceRefresh` | Dependency-driven refreshes; receives the dependent field, config, values, and `{ signal, requestId, field }` |

Callbacks may be inline functions. They are read at call time, so changing them
never recreates actions, controllers, or subscriptions.

## Context stability

`useFormContext()` exposes the store, registry, schema, condition controller,
settings, and actions. Its value changes only when one of those inputs changes:
value, error, touched, and validation-progress updates do not change it, so
components that only read the context do not re-render as fields change.
`useFormActions()` returns the same object for the life of the store.

## Controller lifecycle

With a `schema`, the provider creates a `ConditionController` and a
`DependencyController` in an effect and disposes both on unmount or when the
store or schema changes. Until they mount, including during server rendering,
hooks compute condition state directly from the schema.

`useFormContext` throws outside a provider. Prefer one provider per independent
form; nested providers are diagnosed in development.
