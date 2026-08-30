# @dynamic-form-engine/react

React bindings for `@dynamic-form-engine/core`. React and React DOM 18 or 19 are peer dependencies.

## Core API

- `FormProvider<TValues>` supplies a typed store, schema runtime, validation actions, and lifecycle callbacks.
- `useForm<TValues>` creates the controlled `FormStore<TValues>` and a `FieldRegistry`.
- `useField`, `useFieldState`, `useWatch`, `useFormState`, and `useFormActions` support focused subscriptions.
- `DynamicForm` and `DynamicField` render registered schema controls.
- `useDataSource` loads Core data sources without Suspense.
- `useFormEvent` subscribes to Core events and automatically cleans up on unmount.

## Typed provider and nested paths

```tsx
import { FormProvider, useForm, useWatch } from '@dynamic-form-engine/react';

type Profile = { name: string; address: { city: string } };

function ProfileForm() {
  const form = useForm<Profile>({ defaultValues: { name: '', address: { city: '' } } });
  const city = useWatch<string>('address.city');

  return <FormProvider<Profile> {...form}>{city}</FormProvider>;
}
```

`FieldPath<TValues>` is exported for typed wrapper components. Core's `InferSchemaType` remains available for `as const` schema declarations.

## Custom controls

```tsx
import { FieldRegistry } from '@dynamic-form-engine/core';
import { registerReactField, type FieldComponentProps } from '@dynamic-form-engine/react';

function TextControl({ name, value, setValue, error, disabled }: FieldComponentProps<string>) {
  return <><input name={name} value={value ?? ''} disabled={disabled}
    onChange={(event) => setValue(event.target.value)} />{error && <span>{error}</span>}</>;
}

const registry = new FieldRegistry<typeof TextControl>();
registerReactField(registry, { type: 'text', component: TextControl });
```

Controls receive the schema, current value, mutation methods, validation state, and Core-derived visibility, disabled, required, and read-only flags.

## Async validation and events

Use `validationMode="onChange"`, `"onBlur"`, `"onSubmit"`, or `"manual"`. `useField(name).validate()` returns a promise and stale asynchronous validations cannot overwrite a newer result.

```tsx
function AuditTrail() {
  useFormEvent('valueChange', (event) => console.info(event.field, event.value));
  return null;
}
```

## Data sources

`useDataSource(fieldName)` reads the field's Core `dataSource` configuration. It returns `data`, `loading`, `error`, `refresh`, `cancel`, `search`, `page`, and `pageSize` controls. Requests are cancellable and use Core cache keys; Suspense is deliberately unsupported.

## Development diagnostics

In non-production environments the adapter warns for nested providers, missing schemas, unknown field paths, and unknown field types. These warnings accompany the existing explicit runtime errors for invalid `DynamicField` usage.
## Accessibility

Custom controls must apply `FieldComponentProps.accessibility` to their focusable element and connect their label, description, and error message using the supplied IDs. `DynamicForm` renders a focusable `FormErrorSummary` by default after an invalid submit; set `errorSummary={false}` when rendering a custom summary.

```tsx
function TextControl({ name, value, setValue, error, required, disabled, readOnly, accessibility }: FieldComponentProps<string>) {
  return <div>
    <label id={accessibility.labelId} htmlFor={accessibility.id}>Name</label>
    <input {...accessibility.dataAttributes} id={accessibility.id} name={name} value={value ?? ''} required={required}
      disabled={disabled} readOnly={readOnly} aria-invalid={accessibility.ariaInvalid}
      aria-labelledby={accessibility.ariaLabelledBy} aria-describedby={accessibility.ariaDescribedBy}
      onChange={(event) => setValue(event.target.value)} />
    {error && <p id={accessibility.errorId} role="alert">{error}</p>}
    <LiveRegion>{accessibility.validationMessage}</LiveRegion>
  </div>;
}
```

When a focused conditional field becomes hidden, the adapter moves focus to the next registered dynamic field. Controls should spread `accessibility.dataAttributes` onto their focusable element to participate in this handoff.