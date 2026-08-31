# @dynamic-form-engine/rhf

Headless React Hook Form 7 adapter for Dynamic Forms. Phases 1-4 provide the typed field bridge, guarded Core projection, schema resolver, nested error conversion, validation modes, conditional field state, dependency resets, stale-safe data sources, nested field arrays, lifecycle actions, and explicit file serialization.

## Ownership

React Hook Form is the sole owner of runtime values, dirty and touched state, errors, resets, and submission. `@dynamic-form-engine/core` owns the declarative schema, validation definitions, conditions, dependencies, and data-source configuration. The consuming application selects the renderer.

This boundary avoids maintaining two competing form stores. Adapter synchronization is directional and guarded against feedback loops.

## Conditions and hidden fields

`RHFField` evaluates visibility, disabled, required, and read-only conditions against current RHF values. Its render callback receives `dynamicState` so renderer-neutral controls can apply required and read-only semantics; disabled state is also passed through RHF's controller.

The default hidden-field policy is `retain`: a hidden field keeps its value and restores it when visible again. Set `hiddenFieldPolicy="unregister"` to unregister hidden fields and remove their values. Hidden and disabled fields do not block schema validation.

## Dependencies and data sources

Dependency changes reset downstream fields to their defaults in deterministic graph order and notify `onDataSourceRefresh` for affected fields with data sources. Resets are reconciled back into RHF without replaying a stale form snapshot.

`useRHFDataSource(fieldName, options)` exposes renderer-neutral `data`, `loading`, `error`, `refresh`, and cancellation behavior. Requests use current projected RHF values, obsolete responses are ignored, and failed loads can be retried.


## Structural fields and lifecycle

useRHFFieldArray delegates identity and mutations to RHF's useFieldArray, defaulting to the provider control. It supports append, prepend, insert, update, remove, move, swap, and replace. RHF's stable row IDs are preserved during reordering; whole-array replacement clears obsolete indexed errors, and array-root projection removes old indexed Core values.

useRHFFormActions exposes typed reset, resetField, trigger, setError, clearErrors, and setFocus methods from the authoritative RHF instance. Registered file fields follow normal RHF reset behavior. serializeRHFValues converts files to JSON-safe metadata by default, or can preserve or omit them explicitly; dates serialize to ISO strings and cyclic input is rejected.
## Public API

Current exports:

- `RHF_ADAPTER_CONTRACT`
- `RHFAdapterContract`
- `RHFHiddenFieldPolicy`
- `DynamicFormRHFProvider`
- `DynamicFormRHFProviderProps`
- `DynamicFormRHFContextValue`
- `useDynamicFormRHF`
- `RHFField`
- `RHFFieldProps`
- `RHFDynamicFieldState`
- `useRHFDataSource`
- `UseRHFDataSourceOptions`
- `UseRHFDataSourceResult`
- `useRHFFieldArray`
- `UseRHFFieldArrayProps`
- `useRHFFormActions`
- `RHFFormActions`
- `serializeRHFValues`
- `SerializeRHFValuesOptions`
- `SerializedRHFFile`
- `createRHFResolver`
- `CreateRHFResolverOptions`
- `toRHFErrors`
- `RHFErrorInput`

`RHFForm` and higher-level schema rendering are introduced in later phases.

## Example

```tsx
import { DynamicFormRHFProvider, RHFField } from '@dynamic-form-engine/rhf';

type Profile = { kind: 'person' | 'company'; company: string };

export function ProfileForm() {
  return (
    <DynamicFormRHFProvider<Profile>
      schema={{
        id: 'profile',
        fields: [
          { name: 'kind', type: 'select' },
          {
            name: 'company',
            type: 'text',
            visibleWhen: { field: 'kind', operator: 'equals', value: 'company' },
            requiredWhen: { field: 'kind', operator: 'equals', value: 'company' },
          },
        ],
      }}
      formOptions={{ defaultValues: { kind: 'person', company: '' } }}
    >
      <RHFField<Profile, 'company'>
        name="company"
        render={({ field, dynamicState }) => (
          <input {...field} required={dynamicState.required} readOnly={dynamicState.readOnly} />
        )}
      />
    </DynamicFormRHFProvider>
  );
}
```

Pass `methods={useForm(...)}` to use an externally owned RHF instance. The provider exposes a Core projection for Dynamic Forms behavior, but RHF remains authoritative.

## Package boundaries

The adapter may import `@dynamic-form-engine/core` and `@dynamic-form-engine/react`. It remains renderer-neutral and does not import `@dynamic-form-engine/react-html`. React HTML belongs only in private examples and E2E applications.

## Compatibility target

- React 18 and 19
- React Hook Form 7.x
- The repository-supported TypeScript version

The oldest and newest RHF 7 releases will be verified by the Phase 7 compatibility matrix before release-ready status.

## Development

```bash
pnpm --filter @dynamic-form-engine/rhf build
pnpm --filter @dynamic-form-engine/rhf test
pnpm --filter @dynamic-form-engine/rhf typecheck
pnpm check:boundaries
```

See [the implementation plan](../../rhf-module-implementation-plan.md) for phased acceptance gates.
