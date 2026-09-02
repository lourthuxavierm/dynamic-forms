# React Hook Form adapter

- Status: Implemented through public API and developer-experience phases
- Owner: React adapter maintainers
- Last verified: 2026-09-01
- Applies to: @dynamic-form-engine/rhf 0.1.0, React Hook Form 7.52.0 or newer

The adapter keeps React Hook Form authoritative for values, field state, errors,
resets, and submission while Dynamic Forms evaluates schemas, conditions,
dependencies, validation, and data sources.

The supported RHF range starts at 7.52.0. Earlier RHF 7 releases either lack
required controller behavior or do not declare React 19 compatibility.

## Typed schema and renderer-neutral registry

~~~tsx
import {
  defineRHFSchema,
  DynamicFormRHFProvider,
  RHFForm,
  type RHFControlRegistry,
} from '@dynamic-form-engine/rhf';

type Profile = {
  profile: { city: string };
  contacts: Array<{ email: string }>;
};

const schema = defineRHFSchema<Profile>({
  id: 'profile',
  fields: [
    {
      name: 'profile',
      type: 'object',
      fields: [{ name: 'city', type: 'text', label: 'City' }],
    },
    {
      name: 'contacts',
      type: 'array',
      fields: [{ name: 'email', type: 'text', label: 'Email' }],
    },
  ],
});

const registry: RHFControlRegistry<Profile> = {
  text: ({ schemaField, field, fieldState, dynamicState }) => (
    <label>
      {schemaField.label}
      <input
        {...field}
        value={String(field.value ?? '')}
        aria-invalid={fieldState.invalid}
        disabled={dynamicState.disabled}
        readOnly={dynamicState.readOnly}
      />
    </label>
  ),
};

export function ProfileForm() {
  return (
    <DynamicFormRHFProvider<Profile>
      schema={schema}
      formOptions={{
        defaultValues: {
          profile: { city: '' },
          contacts: [{ email: '' }],
        },
      }}
    >
      <RHFForm
        schema={schema}
        registry={registry}
        onSubmit={async (values) => saveProfile(values)}
      />
    </DynamicFormRHFProvider>
  );
}
~~~

RHFForm recursively renders objects and arrays. Controls remain application-owned,
so the published adapter does not depend on React HTML.

## Migrating from Controller

Before:

~~~tsx
<Controller
  name="profile.city"
  control={methods.control}
  render={({ field, fieldState }) => <CityInput field={field} error={fieldState.error} />}
/>
~~~

For one custom field, replace Controller with RHFField. It supplies the provider
control automatically and adds dynamicState:

~~~tsx
<RHFField<Profile, 'profile.city'>
  name="profile.city"
  render={({ field, fieldState, dynamicState }) => (
    <CityInput field={field} error={fieldState.error} disabled={dynamicState.disabled} />
  )}
/>
~~~

For a complete schema-driven form, move the control into an RHFControlRegistry
and render RHFForm. Keep useForm externally owned by passing methods when another
application layer needs direct RHF access.

## Diagnostics

Development builds warn about nested DynamicFormRHFProvider instances and missing
registry controls. Missing controls still throw in production, but warnings are
suppressed. This prevents silently omitted schema fields.
