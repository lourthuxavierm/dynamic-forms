# Create your first schema

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-form-engine/core` 0.1.0
- Prerequisites: Complete installation

## Outcome

Create a framework-independent employee form schema with initial values. The
same schema can be consumed by any compatible renderer.

## Define the schema

```ts verify
import type { FormSchema } from '@dynamic-form-engine/core';

export interface EmployeeFormValues extends Record<string, unknown> {
  fullName: string;
  email: string;
  department: string;
  acceptTerms: boolean;
}

export const employeeSchema: FormSchema = {
  id: 'employee-profile',
  version: '1.0.0',
  fields: [
    {
      name: 'fullName',
      type: 'text',
      label: 'Full name',
      placeholder: 'Ada Lovelace',
      validation: { required: true, minLength: 2 },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Work email',
      validation: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      },
    },
    {
      name: 'department',
      type: 'select',
      label: 'Department',
      options: [
        { label: 'Engineering', value: 'engineering' },
        { label: 'Design', value: 'design' },
        { label: 'Operations', value: 'operations' },
      ],
      validation: { required: true },
    },
    {
      name: 'acceptTerms',
      type: 'checkbox',
      label: 'I accept the workplace policy',
      validation: { required: true },
    },
  ],
};

export const employeeInitialValues: EmployeeFormValues = {
  fullName: '',
  email: '',
  department: '',
  acceptTerms: false,
};
```

## Understand the contract

- `id` identifies the form definition.
- `version` belongs to your schema-governance policy; the runtime does not
  migrate versions automatically.
- `name` becomes the value and error path.
- `type` selects renderer behavior.
- `validation` stays framework-independent.
- `options` preserves string, number, or boolean option values.

Keep schemas serializable when they cross a network boundary. Functions and
runtime objects require a trusted application-side registration step.

## Verify the result

The TypeScript module should compile without React or renderer imports. Continue
with [rendering the first form](./first-form.md).
