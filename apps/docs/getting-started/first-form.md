# Render your first form

- Status: Documented
- Owner: React and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-form-engine/react` and `@dynamic-form-engine/react-html` 0.1.0
- Prerequisites: React 18 or 19 and a completed schema

## Outcome

Render the schema with React, browser-native controls, default values, and the
optional default stylesheet.

## Add the stylesheet

Import the stylesheet once from your application entry point. This line is
processed by the application bundler rather than the standalone snippet
compiler used by this documentation site.

```ts
import '@dynamic-form-engine/react-html/styles.css';
```

## Render the form

```tsx verify
import type { FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { HtmlForm } from '@dynamic-form-engine/react-html';

const schema: FormSchema = {
  id: 'employee-profile',
  fields: [
    { name: 'fullName', type: 'text', label: 'Full name', validation: { required: true } },
    { name: 'email', type: 'email', label: 'Work email', validation: { required: true } },
  ],
};

export function EmployeeForm() {
  return (
    <FormProvider
      schema={schema}
      defaultValues={{ fullName: '', email: '' }}
      validationMode="onBlur"
    >
      <HtmlForm
        schema={schema}
        submitLabel="Create employee"
        onSubmit={async (values) => {
          console.log('Validated values', values);
        }}
      />
    </FormProvider>
  );
}
```

## Responsibility split

- `FormProvider` owns the store, schema context, conditional behavior, and
  validation operations.
- `HtmlForm` owns the HTML `<form>`, field rendering, submit event, validation
  gate, and its `onSubmit` callback.
- The default registry maps schema field types to React components that render
  browser-native elements.

Provider `onSubmit` is used by the provider's programmatic `submit()` operation.
For the normal `HtmlForm` submit button, pass the handler to `HtmlForm` as shown.

## Verify the result

The page should show Full name, Work email, and Create employee. Submitting empty
values should show validation errors and must not log validated values.

Continue with [validation](./validation.md).
