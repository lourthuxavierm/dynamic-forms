# @dynamic-forms/react API

<!-- GENERATED FILE. Run pnpm docs:api to update. -->

- Maturity: Documented
- Source: TypeScript public exports
- Internal symbols: excluded

Headless React provider, hooks, subscriptions, and renderer extension points.

Related: [guide](../../integrations/react/) · [controls/examples](../../playground/)

## Public exports

This page contains 39 exports. Signatures are regenerated from the package entry point.

### DynamicField

- Kind: function
- Source: `packages/react/src/components/DynamicField.tsx`

Public function exported by @dynamic-forms/react.

```ts
export declare function DynamicField({ field: explicitField, name, type, render }: DynamicFieldProps): import("react").JSX.Element | null
```

### DynamicFieldProps

- Kind: interface
- Source: `packages/react/src/components/DynamicField.tsx`

Public interface exported by @dynamic-forms/react.

```ts
export interface DynamicFieldProps;
```

### DynamicForm

- Kind: function
- Source: `packages/react/src/components/DynamicForm.tsx`

Public function exported by @dynamic-forms/react.

```ts
export declare function DynamicForm({ schema: explicitSchema, children, submitLabel, errorSummary, onSubmit }: DynamicFormProps): import("react").JSX.Element
```

### DynamicFormProps

- Kind: interface
- Source: `packages/react/src/components/DynamicForm.tsx`

Public interface exported by @dynamic-forms/react.

```ts
export interface DynamicFormProps;
```

### FieldAccessibilityProps

- Kind: interface
- Source: `packages/react/src/components/DynamicField.tsx`

Public interface exported by @dynamic-forms/react.

```ts
export interface FieldAccessibilityProps;
```

### FieldArrayItem

- Kind: interface
- Source: `packages/react/src/hooks/useFieldArray.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface FieldArrayItem;
```

### FieldComponentProps

- Kind: interface
- Source: `packages/react/src/components/DynamicField.tsx`

Stable renderer contract. Additions remain optional until the next major release.

```ts
export interface FieldComponentProps;
```

### fieldId

- Kind: function
- Source: `packages/react/src/components/FormErrorSummary.tsx`

Public function exported by @dynamic-forms/react.

```ts
export declare function fieldId(name: string): string
```

### FieldPath

- Kind: type
- Source: `packages/react/src/types.ts`

Dot-separated paths accepted by React form hooks.

```ts
export type FieldPath;
```

### FormContextValue

- Kind: interface
- Source: `packages/react/src/context/FormContext.tsx`

Public interface exported by @dynamic-forms/react.

```ts
export interface FormContextValue;
```

### FormErrorSummary

- Kind: function
- Source: `packages/react/src/components/FormErrorSummary.tsx`

Announces form validation errors and links users to the invalid control.

```ts
export declare function FormErrorSummary({ title, focusOnChange, className }: FormErrorSummaryProps): import("react").JSX.Element | null
```

### FormErrorSummaryProps

- Kind: interface
- Source: `packages/react/src/components/FormErrorSummary.tsx`

Public interface exported by @dynamic-forms/react.

```ts
export interface FormErrorSummaryProps;
```

### FormProvider

- Kind: function
- Source: `packages/react/src/context/FormContext.tsx`

Owns the React form context, store lifecycle, validation mode, and optional submission callbacks.

```ts
export declare function FormProvider<T extends FormValues = FormValues>({ store, registry, schema, defaultValues, children, onSubmit, onError, onChange, onValidate, validationMode, onInvalidSubmit, focusOnInvalidSubmit, onDataSourceRefresh, }: FormProviderProps<T>): import("react").JSX.Element
```

### FormProviderProps

- Kind: interface
- Source: `packages/react/src/context/FormContext.tsx`

Public interface exported by @dynamic-forms/react.

```ts
export interface FormProviderProps;
```

### LiveRegion

- Kind: function
- Source: `packages/react/src/components/LiveRegion.tsx`

A renderer-neutral status announcement for validation and async loading.

```ts
export declare function LiveRegion({ children, mode, atomic, className }: LiveRegionProps): import("react").JSX.Element
```

### LiveRegionProps

- Kind: interface
- Source: `packages/react/src/components/LiveRegion.tsx`

Public interface exported by @dynamic-forms/react.

```ts
export interface LiveRegionProps;
```

### registerReactField

- Kind: function
- Source: `packages/react/src/registry.ts`

Register a React control while preserving the value type it receives.

```ts
export declare function registerReactField<TValue = unknown>(registry: FieldRegistry<ComponentType<FieldComponentProps<TValue>>>, definition: Omit<FieldDefinition<ComponentType<FieldComponentProps<TValue>>>, "component"> & { component: ComponentType<FieldComponentProps<TValue>>; }): FieldRegistry<ComponentType<FieldComponentProps<TValue>>>
```

### TypedFieldPath

- Kind: type
- Source: `packages/react/src/types.ts`

Public type exported by @dynamic-forms/react.

```ts
export type TypedFieldPath;
```

### useDataSource

- Kind: function
- Source: `packages/react/src/hooks/useDataSource.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useDataSource<T = unknown>(fieldName: string, options?: UseDataSourceOptions<T>): UseDataSourceResult<T>
```

### UseDataSourceOptions

- Kind: interface
- Source: `packages/react/src/hooks/useDataSource.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface UseDataSourceOptions;
```

### UseDataSourceResult

- Kind: interface
- Source: `packages/react/src/hooks/useDataSource.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface UseDataSourceResult;
```

### useField

- Kind: function
- Source: `packages/react/src/hooks/useField.ts`

Binds a field path to value, touched state, errors, and validation behavior.

```ts
export declare function useField<T = unknown>(name: string): { name: string; value: T; setValue: (nextValue: T) => void; error: string; touched: boolean; dirty: boolean; isValidating: boolean; setError: (message: string) => void; clearError: () => void; setTouched: (touched?: boolean) => void; validate: () => Promise<boolean>; }
```

### useFieldArray

- Kind: function
- Source: `packages/react/src/hooks/useFieldArray.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useFieldArray<T = unknown>(name: string): UseFieldArrayReturn<T>
```

### UseFieldArrayReturn

- Kind: interface
- Source: `packages/react/src/hooks/useFieldArray.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface UseFieldArrayReturn;
```

### useFieldState

- Kind: function
- Source: `packages/react/src/hooks/useFieldState.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useFieldState(name: string): { visible: boolean; disabled: boolean; required: boolean; readOnly: boolean; error: string; touched: boolean; dirty: boolean; isValidating: boolean; }
```

### useForm

- Kind: function
- Source: `packages/react/src/hooks/useForm.ts`

Creates a typed store and registry for a controlled FormProvider.

```ts
export declare function useForm<TValues extends FormValues = FormValues>(options?: UseFormOptions<TValues>): { store: FormStore<TValues>; registry: FieldRegistry<any>; }
```

### useFormActions

- Kind: function
- Source: `packages/react/src/hooks/useFormState.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useFormActions<T extends FormValues = FormValues>(): { setValue: (path: string, value: unknown, options?: import("@dynamic-forms/core").SetValueOptions) => void; setValues: (values: Partial<T>, options?: import("@dynamic-forms/core").SetValueOptions) => void; setError: (path: string, message: string) => void; clearError: (path: string) => void; validateField: (name: string) => Promise<boolean>; validateForm: () => Promise<boolean>; submit: <TResult = unknown>() => Promise<TResult | undefined>; reset: () => void; resetField: (name: string) => void; }
```

### useFormContext

- Kind: function
- Source: `packages/react/src/context/FormContext.tsx`

Public function exported by @dynamic-forms/react.

```ts
export declare function useFormContext<T extends FormValues = FormValues>(): FormContextValue<T>
```

### useFormEvent

- Kind: function
- Source: `packages/react/src/hooks/useFormEvent.ts`

Subscribe to a Core form event; cleanup is handled with the component lifecycle.

```ts
export declare function useFormEvent(type: FormEventType, listener: FormEventListener): void
```

### UseFormOptions

- Kind: interface
- Source: `packages/react/src/hooks/useForm.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface UseFormOptions;
```

### useFormState

- Kind: function
- Source: `packages/react/src/hooks/useFormState.ts`

Subscribes to a selected form-state slice through React external-store semantics.

```ts
export declare function useFormState<TSelected = FormState<FormValues>>(selector?: (state: FormState) => TSelected): TSelected
```

### useFormStore

- Kind: function
- Source: `packages/react/src/subscriptions/useFormStore.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useFormStore(store: FormStore): FormState
```

### useSection

- Kind: function
- Source: `packages/react/src/hooks/useSection.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useSection(id: string, options?: UseSectionOptions): { id: string; expanded: boolean; disabled: boolean; expand: () => void; collapse: () => void; toggle: () => void; }
```

### UseSectionOptions

- Kind: interface
- Source: `packages/react/src/hooks/useSection.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface UseSectionOptions;
```

### useWatch

- Kind: function
- Source: `packages/react/src/hooks/useWatch.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useWatch<T = unknown>(path: string): T
export declare function useWatch<T = unknown>(paths: readonly string[]): T[]
```

### useWizard

- Kind: function
- Source: `packages/react/src/hooks/useWizard.ts`

Public function exported by @dynamic-forms/react.

```ts
export declare function useWizard(steps: readonly WizardStep[], options?: UseWizardOptions): { steps: readonly WizardStep[]; activeIndex: number; activeStep: WizardStep; isFirst: boolean; isLast: boolean; goTo: (index: number) => void; next: () => void; previous: () => void; }
```

### UseWizardOptions

- Kind: interface
- Source: `packages/react/src/hooks/useWizard.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface UseWizardOptions;
```

### ValidationMode

- Kind: type
- Source: `packages/react/src/context/FormContext.tsx`

Public type exported by @dynamic-forms/react.

```ts
export type ValidationMode;
```

### WizardStep

- Kind: interface
- Source: `packages/react/src/hooks/useWizard.ts`

Public interface exported by @dynamic-forms/react.

```ts
export interface WizardStep;
```

## Deprecations

No exported symbol currently carries a `@deprecated` tag. When one is added, this page displays its replacement and removal target.

