import { useState } from 'react';
import type { FieldOption, FieldSchema, FormSchema } from '@dynamic-forms/core';
import { HtmlForm, HtmlSignatureProvider } from '@dynamic-forms/react-html';
import { FormProvider } from '@dynamic-forms/react';

const countries: readonly FieldOption[] = [
  { label: 'India', value: 'IN' }, { label: 'United States', value: 'US' },
];
const technologies: readonly FieldOption[] = [
  { label: 'React', value: 'react' }, { label: 'Angular', value: 'angular' }, { label: 'Vue', value: 'vue' },
];
const field = (name: string, type: string, extra: Partial<FieldSchema> = {}): FieldSchema => ({
  name, type, label: name, ...extra,
});

const fields: readonly FieldSchema[] = [
  field('text', 'text', { defaultValue: 'Dynamic Forms', validation: { required: true } }),
  field('textarea', 'textarea', { config: { rows: 4 } }),
  field('password', 'password'), field('email', 'email'), field('url', 'url'),
  field('number', 'number', { defaultValue: 10, config: { min: 0, max: 100, step: 0.5 } }),
  field('integer', 'integer', { defaultValue: 5, config: { min: 0, max: 100 } }),
  field('decimal', 'decimal', { defaultValue: 12.5, config: { step: 0.01 } }),
  field('hidden', 'hidden', { defaultValue: 'hidden-example' }),
  field('select', 'select', { defaultValue: 'IN', options: countries }),
  field('multi-select', 'multi-select', { defaultValue: ['react'], options: technologies }),
  field('autocomplete', 'autocomplete', { options: countries }),
  field('async-autocomplete', 'async-autocomplete', {
    dataSource: { type: 'function', cache: true, load: async () => [...technologies] },
  }),
  field('checkbox', 'checkbox', { defaultValue: false }),
  field('checkbox-group', 'checkbox-group', { defaultValue: ['react'], options: technologies }),
  field('radio', 'radio', { defaultValue: 'IN', options: countries }),
  field('radio-group', 'radio-group', { defaultValue: 'react', options: technologies }),
  field('switch', 'switch', { defaultValue: true }),
  field('toggle-button-group', 'toggle-button-group', { defaultValue: ['react'], options: technologies, config: { multiple: true } }),
  field('tree-select', 'tree-select', { options: [
    { label: 'Frontend', value: 'frontend', children: technologies },
    { label: 'Backend', value: 'backend', children: [{ label: 'Node.js', value: 'node' }, { label: '.NET', value: 'dotnet' }] },
  ] }),
  field('date', 'date', { defaultValue: '2026-08-25', config: { minDate: '2020-01-01', maxDate: '2035-12-31' } }),
  field('time', 'time', { defaultValue: '10:30', config: { step: 300 } }),
  field('datetime', 'datetime', { defaultValue: '2026-08-25T10:30' }),
  field('date-range', 'date-range', { defaultValue: ['2026-08-25', '2026-08-30'] }),
  field('time-range', 'time-range', { defaultValue: ['09:00', '17:00'], config: { step: 300 } }),
  field('datetime-range', 'datetime-range', { defaultValue: ['2026-08-25T09:00', '2026-08-25T17:00'] }),
  field('month', 'month', { defaultValue: '2026-08' }),
  field('year', 'year', { defaultValue: 2026, config: { min: 1900, max: 2100, step: 1 } }),
  field('currency', 'currency', { defaultValue: 1000, config: { currency: 'INR', locale: 'en-IN', min: 0, precision: 2 } }),
  field('percentage', 'percentage', { defaultValue: 25, config: { min: 0, max: 100, precision: 1 } }),
  field('slider', 'slider', { defaultValue: 50, config: { min: 0, max: 100, step: 5 } }),
  field('range-slider', 'range-slider', { defaultValue: [20, 80], config: { min: 0, max: 100, step: 5 } }),
  field('rating', 'rating', { defaultValue: 4, config: { maxRating: 5 } }),
  field('phone', 'phone'), field('otp', 'otp', { config: { length: 6 } }),
  field('pin', 'pin', { config: { length: 4 } }),
  field('mask', 'mask', { config: { mask: 'AA-0000' }, placeholder: 'AB-1234' }),
  field('file', 'file', { defaultValue: null, config: { accept: '.pdf,.txt', maxFileSize: 5_000_000 } }),
  field('multi-file', 'multi-file', { defaultValue: [], config: { accept: 'image/*,.pdf', maxFiles: 3, maxFileSize: 5_000_000, imagePreview: true } }),
  field('camera', 'camera', { defaultValue: null, config: { maxFileSize: 5_000_000, imagePreview: true } }),
  field('signature', 'signature'),
  field('document-preview', 'document-preview', {
    defaultValue: 'data:text/html,%3Ch1%3EDynamic%20Forms%3C%2Fh1%3E%3Cp%3EDocument%20preview%3C%2Fp%3E',
    readOnly: true,
  }),
  field('profile', 'object', {
    defaultValue: { firstName: '', lastName: '' },
    fields: [field('firstName', 'text'), field('lastName', 'text')],
  }),
  field('addresses', 'array', {
    defaultValue: [{ street: '', city: '', country: 'IN' }],
    validation: { minItems: 1, maxItems: 4 },
    metadata: { itemLabel: 'Address' },
    fields: [
      field('street', 'text'), field('city', 'text'),
      field('country', 'select', { defaultValue: 'IN', options: countries }),
    ],
  }),
];
const schema: FormSchema = { id: 'native-html-all-controls', fields };
const initialValues = Object.fromEntries(fields.map((item) => [item.name, item.defaultValue ?? '']));

export default function App() {
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState<Readonly<Record<string, unknown>>>();
  return <main className="app-shell">
    <header className="hero"><p className="eyebrow">@dynamic-forms/react-html</p><h1>All native HTML controls</h1>
      <p>All 42 stable controls plus object and array fields, rendered through React.</p></header>
    <section className="demo-grid" aria-label="All Native HTML controls"><div className="form-card">
      <FormProvider key={formKey} schema={schema} defaultValues={initialValues} validationMode="onBlur">
        <HtmlSignatureProvider renderSignature={({ field: signature, onChange }) => <div>
          <button type="button" onClick={() => onChange('Signed')}>Add signature</button>
          <button type="button" className="secondary" onClick={() => onChange('')}>Clear</button>
          <output>{signature.value ? String(signature.value) : 'Not signed'}</output>
        </div>}><HtmlForm schema={schema} submitLabel="Submit all controls" onSubmit={setSubmitted}>
          <button type="button" className="secondary" onClick={() => { setSubmitted(undefined); setFormKey((key) => key + 1); }}>Reset</button>
        </HtmlForm></HtmlSignatureProvider>
      </FormProvider></div>
      <aside className="output-card" aria-live="polite"><h2>Submitted values</h2>
        <pre>{submitted ? JSON.stringify(submitted, fileReplacer, 2) : 'Submit the form to inspect its values.'}</pre></aside>
    </section>
  </main>;
}

function fileReplacer(_key: string, value: unknown): unknown {
  return value instanceof File ? { name: value.name, type: value.type, size: value.size } : value;
}
