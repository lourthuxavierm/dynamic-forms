# @dynamic-form-engine/react

React bindings for `@dynamic-form-engine/core`. React and React DOM 18 or 19 are peer dependencies.

## Core API

- `FormProvider<TValues>` supplies a typed store, schema runtime, validation actions, and lifecycle callbacks.
- `useForm<TValues>` creates the controlled `FormStore<TValues>` and a `FieldRegistry`.
- `useField`, `useFieldState`, `useWatch`, `useFormState` (with `shallowEqual`), and `useFormActions` support focused subscriptions.
- `DynamicForm` and `DynamicField` render registered schema controls.
- `useDataSource` loads Core data sources without Suspense.
- `useFormEvent` subscribes to Core events and automatically cleans up on unmount.

## Typed provider and nested paths

```tsx
import { FormProvider, useForm, useWatch } from '@dynamic-form-engine/react';

type Profile = { name: string; address: { city: string } };

function CityPreview() {
  const city = useWatch<string>('address.city'); // hooks must render inside the provider
  return <output>{city}</output>;
}

function ProfileForm() {
  const form = useForm<Profile>({ defaultValues: { name: '', address: { city: '' } } });
  return <FormProvider<Profile> {...form}><CityPreview /></FormProvider>;
}
```

`FieldPath<TValues>` is exported for typed wrapper components. Use Core's `InferFormValues<typeof schema>` to derive value types from `as const` schemas.

## Provider contract

- **Ownership.** Pass `store` (for example from `useForm`) to control the store, or `defaultValues` to let the provider create one on first render and own it; later `defaultValues` changes are ignored, so call `reset()`.
- **Stable context.** The context value changes only when the store, registry, schema, condition controller, or a form-level setting changes, never on value, error, or validation-progress updates. `useFormActions()` returns the same object for the life of the store, even when `onSubmit`, `onError`, or other callbacks are inline functions; the latest callback is always called.
- **Controllers.** With a `schema`, the provider creates Core's condition and dependency controllers in an effect and disposes them on unmount or schema change. Before they mount (first render, server rendering), field condition state is computed directly from the schema, so hidden fields are never rendered.
- **Form-level state.** `disabled` is synchronized to `store.setDisabled` and blocks submission; `readOnly` applies to every `DynamicField`; fields are disabled while submitting unless `disableWhileSubmitting={false}`.
- **Callbacks.** `onSubmit`, `onError` (submit handler and validator failures, not aborts), `onChange`, `onValidate`, `onReset`, `onEvent` (every Core event), `onInvalidSubmit`, and `onDataSourceRefresh` (receives the abort signal).

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

After an invalid submit, focus moves to the first invalid, enabled, visible control in document order (`focusOnInvalidSubmit`, default `true`).

Use `validationMode="onChange"`, `"onBlur"`, `"onSubmit"`, or `"manual"`. `useField(name).validate()` returns a promise and stale asynchronous validations cannot overwrite a newer result.

```tsx
function AuditTrail() {
  useFormEvent('valueChange', (event) => console.info(event.field, event.value));
  return null;
}
```

## Data sources

`useDataSource(fieldName)` reads the field's Core `dataSource` configuration. It returns `data`, `loading`, `error`, `refresh`, `cancel`, `search`, `page`, and `pageSize` controls. Requests re-run when the configuration's data, the field's dependency values, search, or paging change (inline `config` objects are safe), and pending requests are aborted on unmount. Suspense is deliberately unsupported.

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

## Rendering performance

Each field hook (`useField`, `useFieldState`, `DynamicField`) holds one subscription to its own path, condition state, and validation-progress flag. Changing or validating one field re-renders only that field, verified with a 500-field form. `useFormState(selector, equality?)` re-renders only when the selection changes; pair object-returning selectors with the exported `shallowEqual`.

## Server rendering and Strict Mode

Hooks use `useSyncExternalStore` with server snapshots. Conditional visibility, disabled, required, and read-only state are applied during server rendering and the first client render, and hydration produces no mismatches. Under React Strict Mode every subscription and Core controller is released on unmount.

## Compatibility and stability

React and React DOM 18 and 19 are supported peer dependencies; CI runs this package's tests on React 18.3 and 19.2. The public API is recorded in `api-report.json` and gated in CI under the same stable/experimental and deprecation policy as Core (see `@dynamic-form-engine/core/STABILITY.md`). Published types resolve for bundler, Node ESM, and Node CommonJS consumers.
