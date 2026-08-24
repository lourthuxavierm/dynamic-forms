import type { FormSchema } from '@dynamic-forms/core';

export interface BasicFormValues extends Record<string, unknown> {
  fullName: string;
  email: string;
  age: number | '';
  department: string;
  acceptTerms: boolean;
  startDate: string;
}

export const basicFormSchema: FormSchema = { id: 'basic-employee', version: '1.0.0', fields: [
  { name: 'fullName', type: 'text', label: 'Full name', placeholder: 'Ada Lovelace', validation: { required: true, minLength: 2 } },
  { name: 'email', type: 'email', label: 'Work email', placeholder: 'ada@example.com', validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' } },
  { name: 'age', type: 'number', label: 'Age', validation: { required: true, min: 18, max: 120 } },
  { name: 'department', type: 'select', label: 'Department', options: [{ label: 'Engineering', value: 'engineering' }, { label: 'Design', value: 'design' }, { label: 'Operations', value: 'operations' }], validation: { required: true } },
  { name: 'acceptTerms', type: 'checkbox', label: 'I accept the workplace policy', validation: { required: true } },
  { name: 'startDate', type: 'date', label: 'Start date', validation: { required: true } },
] };

export const basicInitialValues: BasicFormValues = { fullName: '', email: '', age: '', department: '', acceptTerms: false, startDate: '' };
export const basicExampleValues: BasicFormValues = { fullName: 'Ada Lovelace', email: 'ada@example.com', age: 36, department: 'engineering', acceptTerms: true, startDate: '2026-09-01' };
