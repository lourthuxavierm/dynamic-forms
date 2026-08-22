import type { FormSchema } from '@dynamic-forms/core';
export const validationSchema: FormSchema = { id: 'validation-laboratory', fields: [
  { name: 'username', type: 'text', label: 'Username', description: 'Try admin for an async conflict or root for a custom rule.', validation: { required: true, minLength: 3, maxLength: 20, pattern: '^[A-Za-z][A-Za-z0-9_-]+$' } },
  { name: 'email', type: 'email', label: 'Email', validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' } },
  { name: 'age', type: 'number', label: 'Age', validation: { required: true, min: 18, max: 65 } },
  { name: 'password', type: 'password', label: 'Password', validation: { required: true, minLength: 8 } },
  { name: 'confirmPassword', type: 'password', label: 'Confirm password', validation: { required: true } },
] };
export const validationInitialValues = { username: '', email: '', age: '', password: '', confirmPassword: '' };
export const validationSource = `// Schema constraints run in every mode.\n// Domain, cross-field, async, and server errors use useFormActions().setError().`;
