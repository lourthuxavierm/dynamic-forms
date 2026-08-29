import type { FieldOption, FieldSchema, FormSchema } from '@dynamic-forms/core';
import { basicFormSchema, basicInitialValues } from './basic';
import { conditionalInitialValues, conditionalSchema } from './conditions';
import { validationInitialValues, validationSchema } from './validation';

export type ExampleRenderer = 'react-html' | 'angular-html';
export type ExampleCapability = 'runtime' | 'simulated-application-service';
export interface FormExample {
  readonly id: string; readonly title: string; readonly summary: string;
  readonly schema: FormSchema; readonly initialValues: Readonly<Record<string, unknown>>;
  readonly renderers: readonly ExampleRenderer[]; readonly capability: ExampleCapability;
}

const countries: readonly FieldOption[] = [{ label: 'India', value: 'IN' }, { label: 'United States', value: 'US' }];
const roles: readonly FieldOption[] = [{ label: 'Developer', value: 'developer' }, { label: 'Architect', value: 'architect' }];
const field = (name: string, type: string, label: string, extra: Partial<FieldSchema> = {}): FieldSchema => ({ name, type, label, ...extra });
const schema = (id: string, fields: readonly FieldSchema[]): FormSchema => ({ id: `example-${id}`, version: '1.0.0', fields });
const item = (id: string, title: string, summary: string, formSchema: FormSchema, initialValues: Readonly<Record<string, unknown>>, renderers: readonly ExampleRenderer[] = ['react-html'], capability: ExampleCapability = 'runtime'): FormExample => ({ id, title, summary, schema: formSchema, initialValues, renderers, capability });

export const formExamples: readonly FormExample[] = Object.freeze([
  item('basic-form', 'Basic form', 'A minimal employee form with submission and reset.', basicFormSchema, basicInitialValues, ['react-html', 'angular-html']),
  item('core-controls', 'Core controls', 'Common text, choice, boolean, and numeric controls.', schema('core-controls', [
    field('title', 'text', 'Title'), field('role', 'select', 'Role', { options: roles }), field('active', 'checkbox', 'Active'), field('age', 'integer', 'Age', { config: { min: 18, max: 120 } }),
  ]), { title: 'Example', role: 'developer', active: true, age: 30 }, ['react-html', 'angular-html']),
  item('text-numeric', 'Text and numeric controls', 'Text, decimal, currency, and percentage values.', schema('text-numeric', [
    field('description', 'textarea', 'Description', { config: { rows: 3 } }), field('amount', 'currency', 'Budget', { config: { currency: 'USD', locale: 'en-US', min: 0 } }), field('completion', 'percentage', 'Completion', { config: { min: 0, max: 100 } }),
  ]), { description: '', amount: 2500, completion: 25 }),
  item('selection-controls', 'Selection controls', 'Single and multi-value canonical option values.', schema('selection-controls', [
    field('country', 'select', 'Country', { options: countries }), field('technologies', 'checkbox-group', 'Technologies', { options: [{ label: 'React', value: 'react' }, { label: 'Angular', value: 'angular' }] }), field('primary', 'radio', 'Primary framework', { options: roles }),
  ]), { country: 'IN', technologies: ['react'], primary: 'developer' }),
  item('date-time', 'Date and time controls', 'Calendar, time-of-day, and range values.', schema('date-time', [field('startDate', 'date', 'Start date'), field('startTime', 'time', 'Start time'), field('window', 'date-range', 'Delivery window')]), { startDate: '2026-09-01', startTime: '09:30', window: ['2026-09-01', '2026-09-05'] }),
  item('validation-errors', 'Validation and error states', 'Required, length, and numeric constraints.', validationSchema, validationInitialValues),
  item('zod-validation', 'Zod validation', 'Cross-field and format validation through the shared Core validator contract.', schema('zod-validation', [
    field('email', 'email', 'Work email'), field('password', 'password', 'Password'), field('confirmation', 'password', 'Confirm password'),
  ]), { email: '', password: '', confirmation: '' }, ['react-html', 'angular-html']),
  item('conditional-dependencies', 'Conditional fields and dependencies', 'Declarative visibility and dependent behavior.', conditionalSchema, conditionalInitialValues),
  item('async-data', 'Async data sources', 'A deterministic service-backed option source.', schema('async-data', [field('technology', 'async-autocomplete', 'Technology', { dataSource: { type: 'function', cache: true, load: async () => [{ label: 'React', value: 'react' }, { label: 'Angular', value: 'angular' }] } })]), { technology: '' }, ['react-html'], 'simulated-application-service'),
  item('nested-objects-arrays', 'Nested objects and arrays', 'Structured profile and repeatable address values.', schema('nested-objects-arrays', [
    field('profile', 'object', 'Profile', { fields: [field('firstName', 'text', 'First name'), field('lastName', 'text', 'Last name')] }),
    field('addresses', 'array', 'Addresses', { fields: [field('street', 'text', 'Street'), field('country', 'select', 'Country', { options: countries })], validation: { minItems: 1, maxItems: 3 }, metadata: { itemLabel: 'Address' } }),
  ]), { profile: { firstName: '', lastName: '' }, addresses: [{ street: '', country: 'IN' }] }),
  item('file-media', 'File and media fields', 'File metadata with application-owned upload security.', schema('file-media', [field('resume', 'file', 'Resume', { config: { accept: '.pdf', maxFileSize: 5_000_000 } }), field('attachments', 'multi-file', 'Attachments', { config: { maxFiles: 3, maxFileSize: 5_000_000 } })]), { resume: null, attachments: [] }),
  item('schema-loading', 'Schema loading', 'A versioned trusted-repository response.', schema('schema-loading', [field('schemaId', 'hidden', 'Schema ID'), field('displayName', 'text', 'Display name', { validation: { required: true } }), field('region', 'select', 'Region', { options: countries })]), { schemaId: 'employee-profile@1.0.0', displayName: '', region: 'IN' }, ['react-html', 'angular-html'], 'simulated-application-service'),
  item('multi-step-workflow', 'Multi-step workflow', 'Workflow state and step values in one contract.', schema('multi-step-workflow', [field('currentStep', 'hidden', 'Current step'), field('accountName', 'text', 'Account name', { validation: { required: true } }), field('plan', 'select', 'Plan', { options: [{ label: 'Standard', value: 'standard' }, { label: 'Enterprise', value: 'enterprise' }] })]), { currentStep: 'account', accountName: '', plan: 'standard' }, ['react-html'], 'simulated-application-service'),
  item('draft-autosave', 'Draft and autosave', 'Deterministic revision values and simulated save events.', schema('draft-autosave', [field('draftId', 'hidden', 'Draft ID'), field('revision', 'hidden', 'Revision'), field('notes', 'textarea', 'Draft notes', { config: { rows: 4 } })]), { draftId: 'draft-demo-001', revision: 1, notes: '' }, ['react-html'], 'simulated-application-service'),
  item('enterprise-profile', 'Enterprise profile form', 'Identity, role, locale, dates, and structured addresses.', schema('enterprise-profile', [
    field('employeeId', 'text', 'Employee ID', { readOnly: true }), field('name', 'text', 'Full name', { validation: { required: true } }), field('email', 'email', 'Work email', { validation: { required: true } }), field('role', 'select', 'Role', { options: roles }), field('country', 'select', 'Country', { options: countries }), field('startDate', 'date', 'Start date'), field('active', 'checkbox', 'Active employee'),
    field('addresses', 'array', 'Addresses', { fields: [field('street', 'text', 'Street'), field('country', 'select', 'Country', { options: countries })], validation: { minItems: 1, maxItems: 3 }, metadata: { itemLabel: 'Address' } }),
  ]), { employeeId: 'EMP-001', name: '', email: '', role: 'developer', country: 'IN', startDate: '2026-09-01', active: true, addresses: [{ street: '', country: 'IN' }] }),
]);

export const exampleIds = Object.freeze(formExamples.map(({ id }) => id));
export function getFormExample(id: string | null | undefined): FormExample { return formExamples.find((entry) => entry.id === id) ?? formExamples[0]; }
