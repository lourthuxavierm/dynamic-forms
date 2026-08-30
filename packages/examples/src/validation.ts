import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const validationSchema: FormSchema = { id: 'validation-laboratory', version: '1.0.0', fields: [
  { name: 'username', type: 'text', label: 'Username', description: 'Try admin for an async conflict or root for a custom rule.', validation: { required: true, minLength: 3, maxLength: 20, pattern: '^[A-Za-z][A-Za-z0-9_-]+$' } },
  { name: 'email', type: 'email', label: 'Email', validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' } },
  { name: 'age', type: 'number', label: 'Age', validation: { required: true, min: 18, max: 65 } },
  { name: 'password', type: 'password', label: 'Password', validation: { required: true, minLength: 8 } },
  { name: 'confirmPassword', type: 'password', label: 'Confirm password', validation: { required: true } },
] };

export const validationInitialValues = { username: '', email: '', age: '', password: '', confirmPassword: '' };
