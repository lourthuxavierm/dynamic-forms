# @dynamic-form-engine/react API

<!-- GENERATED FILE. Run pnpm docs:api to update. -->

- Maturity: Documented
- Source: TypeScript public exports
- Internal symbols: excluded

Headless React provider, hooks, subscriptions, and renderer extension points.

Related: [guide](../../integrations/react/) · [controls/examples](../../playground/)

## Public exports

This page contains 40 exports. Signatures are regenerated from the package entry point.

### DynamicField

- Kind: function
- Source: `packages/react/src/components/DynamicField.tsx`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function DynamicField({ field: explicitField, name, type, render }: DynamicFieldProps): import("react").JSX.Element | null
```

### DynamicFieldProps

- Kind: interface
- Source: `packages/react/src/components/DynamicField.tsx`

Renders one schema field through its registered component (or `render`). Hidden fields render nothing. `disabled` and `readOnly` combine the field's Core condition state with the provider's form-level `disabled`, `readOnly`, and (by default) `submitting` state.

```ts
export interface DynamicFieldProps;
```

### DynamicForm

- Kind: function
- Source: `packages/react/src/components/DynamicForm.tsx`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function DynamicForm({ schema: explicitSchema, children, submitLabel, errorSummary, onSubmit }: DynamicFormProps): import("react").JSX.Element
```

### DynamicFormProps

- Kind: interface
- Source: `packages/react/src/components/DynamicForm.tsx`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface DynamicFormProps;
```

### FieldAccessibilityProps

- Kind: interface
- Source: `packages/react/src/components/DynamicField.tsx`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface FieldAccessibilityProps;
```

### FieldArrayItem

- Kind: interface
- Source: `packages/react/src/hooks/useFieldArray.ts`

Public interface exported by @dynamic-form-engine/react.

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

Public function exported by @dynamic-form-engine/react.

```ts
export declare function fieldId(name: string): string
```

### FieldPath

- Kind: type
- Source: `packages/react/src/types.ts`

Dot and bracket paths accepted by typed React form hooks.

```ts
export type FieldPath;
```

### FormContextValue

- Kind: interface
- Source: `packages/react/src/context/FormContext.tsx`

Provider context. Its identity changes only when the store, registry, schema, condition controller, or a form-level provider setting changes — never on value, error, or validation-progress updates — so consumers that only read the context do not re-render as fields change.

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

Public interface exported by @dynamic-form-engine/react.

```ts
export interface FormErrorSummaryProps;
```

### FormProvider

- Kind: function
- Source: `packages/react/src/context/FormContext.tsx`

Owns the React form context, store lifecycle, validation mode, and optional submission callbacks.

```ts
export declare function FormProvider<T extends FormValues = DynamicFormValues>(props: FormProviderProps<T>): import("react").JSX.Element
```

### FormProviderProps

- Kind: interface
- Source: `packages/react/src/context/FormContext.tsx`

Public interface exported by @dynamic-form-engine/react.

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

Public interface exported by @dynamic-form-engine/react.

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

### shallowEqual

- Kind: function
- Source: `packages/react/src/hooks/useFormState.ts`

Shallow structural equality for objects and arrays returned by `useFormState` selectors.

```ts
export declare function shallowEqual<T>(previous: T, next: T): boolean
```

### TypedFieldPath

- Kind: type
- Source: `packages/react/src/types.ts`

Explicitly typed or runtime-branded paths accepted by schema-driven hooks.

```ts
export type TypedFieldPath;
```

### useDataSource

- Kind: function
- Source: `packages/react/src/hooks/useDataSource.ts`

Loads a field's data source. Requests are re-run when the configuration's data (not its object identity), the field's dependency values, the search term, page, or page size change, so inline `config` objects are safe. A changed `load` function identity alone does not trigger a request; the latest function is used on the next load. Pending requests are cancelled on unmount and whenever a newer request starts.

```ts
export declare function useDataSource<T = unknown>(fieldName: string, options?: UseDataSourceOptions<T>): UseDataSourceResult<T>
```

### UseDataSourceOptions

- Kind: interface
- Source: `packages/react/src/hooks/useDataSource.ts`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface UseDataSourceOptions;
```

### UseDataSourceResult

- Kind: interface
- Source: `packages/react/src/hooks/useDataSource.ts`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface UseDataSourceResult;
```

### useField

- Kind: function
- Source: `packages/react/src/hooks/useField.ts`

Binds a field path to value, touched state, errors, and validation behavior.

```ts
export declare function useField<T = unknown>(name: string): { name: string; value: T; setValue: (nextValue: T) => void; error: string | undefined; touched: boolean; dirty: boolean; isValidating: boolean; visible: boolean; disabled: boolean; required: boolean; readOnly: boolean; setError: (message: string) => void; clearError: () => void; setTouched: (touched?: boolean) => void; validate: () => Promise<boolean>; }
```

### useFieldArray

- Kind: function
- Source: `packages/react/src/hooks/useFieldArray.ts`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function useFieldArray<T = unknown>(name: string): UseFieldArrayReturn<T>
```

### UseFieldArrayReturn

- Kind: interface
- Source: `packages/react/src/hooks/useFieldArray.ts`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface UseFieldArrayReturn;
```

### useFieldState

- Kind: function
- Source: `packages/react/src/hooks/useFieldState.ts`

Error, touched, dirty, validation progress, and Core condition state (visible, disabled, required, read-only) for one field, without its value or actions. Condition state is correct on the first render and during server rendering, before the provider's condition controller mounts.

```ts
export declare function useFieldState(name: string): { error: string | undefined; touched: boolean; dirty: boolean; isValidating: boolean; visible: boolean; disabled: boolean; required: boolean; readOnly: boolean; }
```

### useForm

- Kind: function
- Source: `packages/react/src/hooks/useForm.ts`

Creates a typed store and registry for a controlled FormProvider.

```ts
export declare function useForm<TValues extends FormValues = DynamicFormValues>(options?: UseFormOptions<TValues>): { store: FormStore<TValues>; registry: FieldRegistry<unknown, Record<string, unknown>, string>; }
```

### useFormActions

- Kind: function
- Source: `packages/react/src/hooks/useFormState.ts`

Stable mutation, validation, submission, and reset actions. Does not subscribe to state, and the returned object keeps its identity for the life of the store, even when provider callbacks such as `onSubmit` are inline.

```ts
export declare function useFormActions<T extends FormValues = DynamicFormValues>(): { setValue: { <TPath extends import("@dynamic-form-engine/core").Path<T>>(path: TPath, value: import("@dynamic-form-engine/core").PathValue<T, TPath>, options?: import("@dynamic-form-engine/core").SetValueOptions): void; (path: import("@dynamic-form-engine/core").DynamicPath, value: unknown, options?: import("@dynamic-form-engine/core").SetValueOptions): void; }; setValues: (values: Partial<T>, options?: import("@dynamic-form-engine/core").SetValueOptions) => void; setError: { <TPath extends import("@dynamic-form-engine/core").Path<T>>(path: TPath, message: string): void; (path: import("@dynamic-form-engine/core").DynamicPath, message: string): void; }; clearError: { <TPath extends import("@dynamic-form-engine/core").Path<T>>(path: TPath): void; (path: import("@dynamic-form-engine/core").DynamicPath): void; }; validateField: (name: string) => Promise<boolean>; validateForm: () => Promise<boolean>; submit: <TResult = unknown>() => Promise<TResult | undefined>; reset: () => void; resetField: (name: string) => void; }
```

### useFormContext

- Kind: function
- Source: `packages/react/src/context/FormContext.tsx`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function useFormContext<T extends FormValues = DynamicFormValues>(): FormContextValue<T>
```

### useFormEvent

- Kind: function
- Source: `packages/react/src/hooks/useFormEvent.ts`

Subscribe to a Core form event for the component's lifetime. The listener may be an inline function: the subscription is created once per store and event type and always calls the latest listener.

```ts
export declare function useFormEvent(type: FormEventType, listener: FormEventListener): void
```

### UseFormOptions

- Kind: interface
- Source: `packages/react/src/hooks/useForm.ts`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface UseFormOptions;
```

### useFormState

- Kind: function
- Source: `packages/react/src/hooks/useFormState.ts`

Subscribes to a selected form-state slice through React external-store semantics.

```ts
export declare function useFormState<TSelected = FormState<DynamicFormValues>>(selector?: (state: FormState) => TSelected, equality?: (previous: TSelected, next: TSelected) => boolean): TSelected
```

### useFormStore

- Kind: function
- Source: `packages/react/src/subscriptions/useFormStore.ts`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function useFormStore(store: FormStore): FormState
```

### useSection

- Kind: function
- Source: `packages/react/src/hooks/useSection.ts`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function useSection(id: string, options?: UseSectionOptions): { id: string; expanded: boolean; disabled: boolean; expand: () => void; collapse: () => void; toggle: () => void; }
```

### UseSectionOptions

- Kind: interface
- Source: `packages/react/src/hooks/useSection.ts`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface UseSectionOptions;
```

### useWatch

- Kind: function
- Source: `packages/react/src/hooks/useWatch.ts`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function useWatch<T = unknown>(path: string): T
export declare function useWatch<T = unknown>(paths: readonly string[]): T[]
```

### useWizard

- Kind: function
- Source: `packages/react/src/hooks/useWizard.ts`

Public function exported by @dynamic-form-engine/react.

```ts
export declare function useWizard(steps: readonly WizardStep[], options?: UseWizardOptions): { steps: readonly WizardStep[]; activeIndex: number; activeStep: WizardStep; isFirst: boolean; isLast: boolean; goTo: (index: number) => void; next: () => void; previous: () => void; }
```

### UseWizardOptions

- Kind: interface
- Source: `packages/react/src/hooks/useWizard.ts`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface UseWizardOptions;
```

### ValidationMode

- Kind: type
- Source: `packages/react/src/context/FormContext.tsx`

Public type exported by @dynamic-form-engine/react.

```ts
export type ValidationMode;
```

### WizardStep

- Kind: interface
- Source: `packages/react/src/hooks/useWizard.ts`

Public interface exported by @dynamic-form-engine/react.

```ts
export interface WizardStep;
```

## Deprecations

No exported symbol currently carries a `@deprecated` tag. When one is added, this page displays its replacement and removal target.

