# Add validation

- Status: Documented
- Owner: Core, React, and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: Core, React, and React HTML 0.1.0
- Prerequisites: A rendered React HTML form

## Outcome

Apply framework-independent validation, choose when fields validate, and handle
an invalid submission without sending values.

## Define rules in the schema

```ts verify
import type { FormSchema } from '@dynamic-forms/core';

export const validatedSchema: FormSchema = {
  id: 'validated-profile',
  fields: [
    {
      name: 'fullName',
      type: 'text',
      label: 'Full name',
      validation: { required: true, minLength: 2, maxLength: 100 },
    },
    {
      name: 'age',
      type: 'number',
      label: 'Age',
      validation: { required: true, min: 18, max: 120 },
    },
  ],
};
```

## Select a validation mode

| Mode | Behavior |
| --- | --- |
| `onBlur` | Validate after the user leaves a field; this is the default. |
| `onChange` | Validate as values change. |
| `onSubmit` | Defer field validation until submission. |
| `manual` | Validate through explicit actions or submission. |

Submission always validates the form before `HtmlForm.onSubmit` runs.

## Observe invalid submission

```tsx verify
import type { FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { HtmlForm } from '@dynamic-forms/react-html';

const schema: FormSchema = {
  id: 'validation-example',
  fields: [
    { name: 'email', type: 'email', label: 'Email', validation: { required: true } },
  ],
};

export function ValidatedForm() {
  return (
    <FormProvider
      schema={schema}
      defaultValues={{ email: '' }}
      validationMode="onBlur"
      onInvalidSubmit={(errors) => console.warn('Invalid form', errors)}
      focusOnInvalidSubmit
    >
      <HtmlForm
        schema={schema}
        onSubmit={async (values) => console.log('Valid form', values)}
      />
    </FormProvider>
  );
}
```

## Accessible error behavior

React HTML connects labels, descriptions, and errors with semantic attributes.
The form error summary is enabled by default, and invalid submission can focus
the first invalid named control. Applications remain responsible for testing
custom controls and style overrides with keyboard and assistive technology.

## Failure modes

- A missing schema prevents schema-driven validation.
- A field name that differs from its stored path validates the wrong value or
  no value.
- A required checkbox must store `true`; `false` remains invalid.
- Server rejection is not a substitute for client validation and must be
  represented separately.

Continue with [safe submission](./submission.md).
