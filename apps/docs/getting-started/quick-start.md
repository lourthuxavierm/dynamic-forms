# Quick start

This walkthrough renders a validated form with accessible browser-native controls.

## 1. Install dependencies

Follow [Installation](./installation.md), then import the optional stylesheet:

```ts
import '@dynamic-forms/react-html/styles.css';
```

## 2. Add the form

```tsx
import type { FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { HtmlForm } from '@dynamic-forms/react-html';

const schema: FormSchema = {
  id: 'profile',
  fields: [
    { name: 'name', type: 'text', label: 'Full name', validation: { required: true } },
    { name: 'email', type: 'email', label: 'Work email', validation: { required: true } },
  ],
};

export function ProfileForm() {
  return (
    <FormProvider schema={schema} onSubmit={async (values) => console.log(values)}>
      <HtmlForm schema={schema} />
    </FormProvider>
  );
}
```

## How the flow works

- `FormSchema` defines fields and validation independently of React and visual rendering.
- `FormProvider` owns form state, validation, conditions, and submission.
- `HtmlForm` maps field types through the native control registry and owns the form element.
- `onSubmit` runs only after schema validation succeeds.
- Native controls expose errors and descriptions through accessible HTML attributes.

## Next steps

- Learn the [schema contract](./schema-basics.md).
- Understand [React state and provider setup](./react-setup.md).
- Read the [React HTML package guide](../packages/react-html.md).
