import { useMemo, useState } from 'react';
import { useForm, useFormState, useWatch, type FieldErrors } from 'react-hook-form';
import {
  createRHFResolver,
  defineRHFSchema,
  DynamicFormRHFProvider,
  RHFForm,
  useDynamicFormRHF,
  useRHFDataSource,
  useRHFFieldArray,
  useRHFFormActions,
  type RHFArrayActionsProps,
  type RHFControlProps,
  type RHFControlRegistry,
} from '@dynamic-form-engine/rhf';
import type { FieldOption, FormErrors } from '@dynamic-form-engine/core';

type Values = {
  firstName: string;
  age: number | null;
  employment: 'personal' | 'business';
  company: string;
  username: string;
  profile: { city: string };
  contacts: Array<{ email: string }>;
  country: 'US' | 'IN';
  region: string;
};

const defaults: Values = {
  firstName: '',
  age: null,
  employment: 'personal',
  company: '',
  username: '',
  profile: { city: 'Mumbai' },
  contacts: [{ email: 'ada@example.com' }],
  country: 'US',
  region: '',
};

const wait = (milliseconds: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = setTimeout(resolve, milliseconds);
  signal?.addEventListener('abort', () => {
    clearTimeout(timer);
    reject(new DOMException('Aborted', 'AbortError'));
  }, { once: true });
});
let sourceCompletions = 0;
let validationCompletions = 0;


const schema = defineRHFSchema<Values>({
  id: 'rhf-e2e',
  fields: [
    { name: 'firstName', type: 'text', label: 'First name', validation: { required: true } },
    { name: 'age', type: 'number', label: 'Age', validation: { min: 18 } },
    {
      name: 'employment',
      type: 'select',
      label: 'Account type',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
      ],
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      visibleWhen: { field: 'employment', operator: 'equals', value: 'business' },
      requiredWhen: { field: 'employment', operator: 'equals', value: 'business' },
    },
    { name: 'username', type: 'text', label: 'Username' },
    {
      name: 'profile',
      type: 'object',
      label: 'Profile',
      fields: [{ name: 'city', type: 'text', label: 'City' }],
    },
    {
      name: 'contacts',
      type: 'array',
      label: 'Contacts',
      fields: [{ name: 'email', type: 'email', label: 'Contact email', validation: { required: true } }],
    },
    {
      name: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'India', value: 'IN' },
      ],
    },
    {
      name: 'region',
      type: 'async-select',
      label: 'Region',
      dependsOn: ['country'],
      resetOnDependencyChange: true,
      dataSource: {
        type: 'function',
        load: async ({ values, signal }) => {
          const country = String(values.country);
          await wait(country === 'US' ? 80 : 10, signal);
          sourceCompletions += 1;
          document.documentElement.dataset.sourceCompletions = String(sourceCompletions);
          return country === 'US' ? ['California', 'Texas'] : ['Karnataka', 'Maharashtra'];
        },
      },
    },
  ],
});

async function validateAsync(values: Values): Promise<FormErrors> {
  if (!values.username) return {};
  await wait(values.username === 'taken' ? 80 : 10);
  validationCompletions += 1;
  document.documentElement.dataset.validationCompletions = String(validationCompletions);
  return values.username === 'taken' ? { username: 'Username unavailable' } : {};
}

function TextControl({ schemaField, field, fieldState, dynamicState }: RHFControlProps<Values>) {
  return <div className="field">
    <label htmlFor={field.name}>{schemaField.label}</label>
    <input
      {...field}
      id={field.name}
      value={String(field.value ?? '')}
      aria-invalid={fieldState.invalid}
      aria-describedby={fieldState.error ? field.name + '-error' : undefined}
      disabled={dynamicState.disabled}
      readOnly={dynamicState.readOnly}
    />
    {fieldState.error ? <span id={field.name + '-error'} role="status">{fieldState.error.message}</span> : null}
  </div>;
}

function NumberControl({ schemaField, field, fieldState }: RHFControlProps<Values>) {
  return <div className="field">
    <label htmlFor={field.name}>{schemaField.label}</label>
    <input
      ref={field.ref}
      id={field.name}
      name={field.name}
      type="number"
      value={field.value === null || field.value === undefined ? '' : String(field.value)}
      onBlur={field.onBlur}
      onChange={(event) => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
      aria-invalid={fieldState.invalid}
    />
    {fieldState.error ? <span role="status">{fieldState.error.message}</span> : null}
  </div>;
}

function SelectControl({ schemaField, field, fieldState }: RHFControlProps<Values>) {
  return <div className="field">
    <label htmlFor={field.name}>{schemaField.label}</label>
    <select {...field} id={field.name} value={String(field.value ?? '')} aria-invalid={fieldState.invalid}>
      {(schemaField.options ?? []).map((option: FieldOption) => (
        <option key={String(option.value)} value={String(option.value)}>{option.label}</option>
      ))}
    </select>
    {fieldState.error ? <span role="status">{fieldState.error.message}</span> : null}
  </div>;
}

function AsyncSelectControl({ schemaField, field }: RHFControlProps<Values>) {
  const source = useRHFDataSource<string>(field.name, { debounceMs: 0 });
  return <div className="field">
    <label htmlFor={field.name}>{schemaField.label}</label>
    <select {...field} id={field.name} value={String(field.value ?? '')} aria-busy={source.loading}>
      <option value="">Choose region</option>
      {source.data.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
    <output aria-label="Region loading">{String(source.loading)}</output>
    <output aria-label="Region options">{source.data.join(',')}</output>
    {source.error ? <span role="alert">{source.error.message}</span> : null}
  </div>;
}

const registry: RHFControlRegistry<Values> = {
  text: TextControl,
  email: TextControl,
  number: NumberControl,
  select: SelectControl,
  'async-select': AsyncSelectControl,
};

function flattenErrors(errors: FieldErrors<Values>, prefix = ''): Array<[string, string]> {
  const result: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
      result.push([path, value.message]);
    } else if (value && typeof value === 'object') {
      result.push(...flattenErrors(value as FieldErrors<Values>, path));
    }
  }
  return result;
}

function RuntimePanel({
  submitted,
  submitCount,
  refreshCount,
}: {
  submitted: Values | null;
  submitCount: number;
  refreshCount: number;
}) {
  const { methods } = useDynamicFormRHF<Values>();
  const values = useWatch({ control: methods.control });
  const state = useFormState({ control: methods.control });
  const errors = flattenErrors(state.errors);
  return <aside aria-label="RHF state">
    {errors.length ? <section role="alert" aria-label="Error summary">
      <h2>Fix these errors</h2>
      <ul>{errors.map(([path, message]) => <li key={path}><button type="button" onClick={() => methods.setFocus(path as never)}>{message}</button></li>)}</ul>
    </section> : null}
    <output aria-label="Watched values">{JSON.stringify(values)}</output>
    <output aria-label="Errors">{JSON.stringify(Object.fromEntries(errors))}</output>
    <output aria-label="Dirty fields">{JSON.stringify(state.dirtyFields)}</output>
    <output aria-label="Touched fields">{JSON.stringify(state.touchedFields)}</output>
    <output aria-label="Is valid">{String(state.isValid)}</output>
    <output aria-label="Submit count">{String(submitCount)}</output>
    <output aria-label="Refresh count">{String(refreshCount)}</output>
    <output aria-label="Submitted JSON">{submitted ? JSON.stringify(submitted) : ''}</output>
  </aside>;
}

function Actions() {
  const { methods } = useDynamicFormRHF<Values>();
  const actions = useRHFFormActions<Values>();
  const contacts = useRHFFieldArray<Values, 'contacts'>({ name: 'contacts' });
  return <nav aria-label="Form actions">
    <button type="button" onClick={() => actions.resetField('profile.city')}>Reset city</button>
    <button type="button" onClick={() => actions.reset()}>Reset form</button>
    <button type="button" onClick={() => methods.setValue('firstName', 'Programmatic', { shouldDirty: true })}>Set first name externally</button>
  </nav>;
}

function ArrayActions({ array }: RHFArrayActionsProps<Values>) {
  return <div>
    <button type="button" onClick={() => array.append({ email: '' })}>Add contact</button>
    <button type="button" onClick={() => array.move(0, array.fields.length - 1)}>Move first contact</button>
    <button type="button" onClick={() => array.remove(0)}>Remove first contact</button>
  </div>;
}
export function App() {
  const methods = useForm<Values>({
    defaultValues: defaults,
    resolver: createRHFResolver<Values>(schema, { formValidator: validateAsync }),
    mode: 'onChange',
  });
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const stableRegistry = useMemo(() => registry, []);

  return <main>
    <h1>React Hook Form E2E Playground</h1>
    <DynamicFormRHFProvider<Values>
      schema={schema}
      methods={methods}
      onDataSourceRefresh={() => setRefreshCount((count) => count + 1)}
    >
      <RHFForm
        schema={schema}
        registry={stableRegistry}
        submitLabel="Submit profile"
        renderArrayActions={(props) => <ArrayActions {...props} />}
        onSubmit={(values) => {
          setSubmitCount((count) => count + 1);
          setSubmitted(values);
        }}
      >
        <Actions />
      </RHFForm>
      <RuntimePanel submitted={submitted} submitCount={submitCount} refreshCount={refreshCount} />
    </DynamicFormRHFProvider>
  </main>;
}
