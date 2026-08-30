# React setup

`@dynamic-form-engine/react` connects a Core `FormStore` to React. Place one `FormProvider` around each independent form.

```tsx verify
import type { FormSchema } from '@dynamic-form-engine/core';
import { FormProvider, useField } from '@dynamic-form-engine/react';

const schema: FormSchema = {
  id: 'newsletter',
  fields: [{ name: 'email', type: 'email', validation: { required: true } }],
};

function EmailStatus() {
  const email = useField<string>('email');
  return <span>{email.dirty ? 'Edited' : 'Not edited'}</span>;
}

export function Newsletter() {
  return (
    <FormProvider schema={schema} defaultValues={{ email: '' }} validationMode="onBlur">
      <EmailStatus />
    </FormProvider>
  );
}
```

## Provider responsibilities

The provider exposes the store, schema, registry, validation, reset, and submission operations. `defaultValues` initializes its internal store. For external ownership, create a stable store with `useForm` and pass its `store` to the provider.

## Validation modes

- `onBlur` is the default and validates after a field is touched.
- `onChange` validates as values change.
- `onSubmit` defers field validation until the form is submitted.
- `manual` validates only through explicit actions or form submission.

Use `useField` for a control, `useWatch` for selected values, and `useFormState` with a selector for form-level UI. All must run beneath the matching provider.

Continue with the [React HTML package guide](../packages/react-html.md) to render the schema.
