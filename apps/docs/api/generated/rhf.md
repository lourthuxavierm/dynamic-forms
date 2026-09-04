# @dynamic-form-engine/rhf API

<!-- GENERATED FILE. Run pnpm docs:api to update. -->

- Maturity: Release-ready
- Source: TypeScript public exports
- Internal symbols: excluded

React Hook Form 7 adapter with typed schema rendering, validation, conditions, dependencies, arrays, and lifecycle integration.

Related: [guide](../../integrations/rhf) · [controls/examples](../../integrations/rhf#typed-schema-and-renderer-neutral-registry)

## Public exports

This page contains 33 exports. Signatures are regenerated from the package entry point.

### createRHFResolver

- Kind: function
- Source: `packages/rhf/src/resolver.ts`

Creates a code-preserving, nested-error RHF resolver from a Dynamic Forms schema.

```ts
export declare function createRHFResolver<TFieldValues extends FieldValues = FieldValues>(schema: FormSchema, options?: CreateRHFResolverOptions<TFieldValues>): Resolver<TFieldValues>
```

### CreateRHFResolverOptions

- Kind: interface
- Source: `packages/rhf/src/resolver.ts`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface CreateRHFResolverOptions;
```

### defineRHFSchema

- Kind: function
- Source: `packages/rhf/src/RHFForm.tsx`

Attaches a compile-time values type to a runtime FormSchema without changing its runtime representation.

```ts
export declare function defineRHFSchema<TFieldValues extends FieldValues>(schema: FormSchema): TypedRHFFormSchema<TFieldValues>
```

### DynamicFormRHFContextValue

- Kind: interface
- Source: `packages/rhf/src/provider.tsx`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface DynamicFormRHFContextValue;
```

### DynamicFormRHFProvider

- Kind: function
- Source: `packages/rhf/src/provider.tsx`

Makes React Hook Form authoritative while projecting values into Dynamic Forms runtime behavior.

```ts
export declare function DynamicFormRHFProvider<TFieldValues extends FieldValues = FieldValues>({ schema, children, methods: externalMethods, formOptions, hiddenFieldPolicy, onDataSourceRefresh, }: DynamicFormRHFProviderProps<TFieldValues>): import("react").JSX.Element
```

### DynamicFormRHFProviderProps

- Kind: interface
- Source: `packages/rhf/src/provider.tsx`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface DynamicFormRHFProviderProps;
```

### InferRHFValues

- Kind: type
- Source: `packages/rhf/src/RHFForm.tsx`

Public type exported by @dynamic-form-engine/rhf.

```ts
export type InferRHFValues;
```

### RHF_ADAPTER_CONTRACT

- Kind: const
- Source: `packages/rhf/src/contract.ts`

Public ownership contract used by documentation, diagnostics, and consumers. Runtime field synchronization is introduced in Phase 1.

```ts
export declare const RHF_ADAPTER_CONTRACT: Readonly<RHFAdapterContract>;
```

### RHFAdapterContract

- Kind: interface
- Source: `packages/rhf/src/contract.ts`

Stable ownership boundary for the React Hook Form adapter.

```ts
export interface RHFAdapterContract;
```

### RHFArrayActionsProps

- Kind: interface
- Source: `packages/rhf/src/RHFForm.tsx`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface RHFArrayActionsProps;
```

### RHFControlComponent

- Kind: type
- Source: `packages/rhf/src/RHFForm.tsx`

Public type exported by @dynamic-form-engine/rhf.

```ts
export type RHFControlComponent;
```

### RHFControlProps

- Kind: interface
- Source: `packages/rhf/src/RHFForm.tsx`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface RHFControlProps;
```

### RHFControlRegistry

- Kind: type
- Source: `packages/rhf/src/RHFForm.tsx`

Public type exported by @dynamic-form-engine/rhf.

```ts
export type RHFControlRegistry;
```

### RHFDynamicFieldState

- Kind: interface
- Source: `packages/rhf/src/RHFField.tsx`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface RHFDynamicFieldState;
```

### RHFErrorInput

- Kind: type
- Source: `packages/rhf/src/resolver.ts`

Public type exported by @dynamic-form-engine/rhf.

```ts
export type RHFErrorInput;
```

### RHFField

- Kind: function
- Source: `packages/rhf/src/RHFField.tsx`

Controller-backed field with Dynamic Forms condition state and hidden-field policy.

```ts
export declare function RHFField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ control, render, disabled, shouldUnregister, ...props }: RHFFieldProps<TFieldValues, TName>): import("react").JSX.Element | null
```

### RHFFieldProps

- Kind: type
- Source: `packages/rhf/src/RHFField.tsx`

Public type exported by @dynamic-form-engine/rhf.

```ts
export type RHFFieldProps;
```

### RHFForm

- Kind: function
- Source: `packages/rhf/src/RHFForm.tsx`

Renders a complete typed schema through an application-owned renderer-neutral control registry and submits through RHF.

```ts
export declare function RHFForm<TFieldValues extends FieldValues = FieldValues>({ schema: explicitSchema, registry, onSubmit, onInvalid, children, submitLabel, noValidate, className, onNativeSubmit, renderArrayActions, }: RHFFormProps<TFieldValues>): import("react").JSX.Element
```

### RHFFormActions

- Kind: interface
- Source: `packages/rhf/src/useRHFFormActions.ts`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface RHFFormActions;
```

### RHFFormProps

- Kind: interface
- Source: `packages/rhf/src/RHFForm.tsx`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface RHFFormProps;
```

### RHFHiddenFieldPolicy

- Kind: type
- Source: `packages/rhf/src/contract.ts`

Defines how a conditionally hidden field participates in RHF state.

```ts
export type RHFHiddenFieldPolicy;
```

### SerializedRHFFile

- Kind: interface
- Source: `packages/rhf/src/serialization.ts`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface SerializedRHFFile;
```

### serializeRHFValues

- Kind: function
- Source: `packages/rhf/src/serialization.ts`

Public function exported by @dynamic-form-engine/rhf.

```ts
export declare function serializeRHFValues<T>(values: T, options?: SerializeRHFValuesOptions): unknown
```

### SerializeRHFValuesOptions

- Kind: interface
- Source: `packages/rhf/src/serialization.ts`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface SerializeRHFValuesOptions;
```

### toRHFErrors

- Kind: function
- Source: `packages/rhf/src/resolver.ts`

Converts flat Core paths into RHF's nested object/array error structure.

```ts
export declare function toRHFErrors<TFieldValues extends FieldValues = FieldValues>(input: RHFErrorInput): FieldErrors<TFieldValues>
```

### TypedRHFFormSchema

- Kind: type
- Source: `packages/rhf/src/RHFForm.tsx`

Public type exported by @dynamic-form-engine/rhf.

```ts
export type TypedRHFFormSchema;
```

### useDynamicFormRHF

- Kind: function
- Source: `packages/rhf/src/provider.tsx`

Returns the RHF methods and the read-only Dynamic Forms projection store.

```ts
export declare function useDynamicFormRHF<TFieldValues extends FieldValues = FieldValues>(): DynamicFormRHFContextValue<TFieldValues>
```

### useRHFDataSource

- Kind: function
- Source: `packages/rhf/src/useRHFDataSource.ts`

RHF-facing alias for the cancellable Core data-source hook.

```ts
export declare function useRHFDataSource<T = unknown>(fieldName: string, options?: UseDataSourceOptions<T>): UseDataSourceResult<T>
```

### UseRHFDataSourceOptions

- Kind: interface
- Source: `packages/react/src/hooks/useDataSource.ts`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface UseDataSourceOptions;
```

### UseRHFDataSourceResult

- Kind: interface
- Source: `packages/react/src/hooks/useDataSource.ts`

Public interface exported by @dynamic-form-engine/rhf.

```ts
export interface UseDataSourceResult;
```

### useRHFFieldArray

- Kind: function
- Source: `packages/rhf/src/useRHFFieldArray.ts`

Uses RHF's field-array identity and mutations while defaulting to the adapter provider's authoritative control instance. Whole-array replacement also removes errors belonging to rows that no longer exist.

```ts
export declare function useRHFFieldArray<TFieldValues extends FieldValues = FieldValues, TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>, TKeyName extends string = "id">(props: UseRHFFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName>
```

### UseRHFFieldArrayProps

- Kind: type
- Source: `packages/rhf/src/useRHFFieldArray.ts`

Public type exported by @dynamic-form-engine/rhf.

```ts
export type UseRHFFieldArrayProps;
```

### useRHFFormActions

- Kind: function
- Source: `packages/rhf/src/useRHFFormActions.ts`

Typed lifecycle and imperative operations for the authoritative RHF form.

```ts
export declare function useRHFFormActions<TFieldValues extends FieldValues = FieldValues>(): RHFFormActions<TFieldValues>
```

## Deprecations

No exported symbol currently carries a `@deprecated` tag. When one is added, this page displays its replacement and removal target.

