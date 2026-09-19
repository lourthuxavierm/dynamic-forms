# @dynamic-form-engine/core API

<!-- GENERATED FILE. Run pnpm docs:api to update. -->

- Maturity: Implemented
- Source: TypeScript public exports
- Internal symbols: excluded

Framework-independent schema, state, validation, conditions, dependencies, data sources, and lifecycle contracts.

Related: [guide](../../runtime/) · [controls/examples](../../playground/)

## Public exports

This page contains 164 exports. Signatures are regenerated from the package entry point.

### ArrayFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Framework-neutral constraints for array structural fields.

```ts
export interface ArrayFieldConfig;
```

### ArrayFieldSchema

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ArrayFieldSchema;
```

### ArrayValidationRules

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ArrayValidationRules;
```

### AsyncRequestContext

- Kind: interface
- Source: `packages/core/src/async/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface AsyncRequestContext;
```

### AsyncRequestManager

- Kind: class
- Source: `packages/core/src/async/manager.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class AsyncRequestManager;
```

### AsyncRequestManagerOptions

- Kind: interface
- Source: `packages/core/src/async/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface AsyncRequestManagerOptions;
```

### AsyncRequestResult

- Kind: interface
- Source: `packages/core/src/async/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface AsyncRequestResult;
```

### AsyncRequestState

- Kind: interface
- Source: `packages/core/src/async/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface AsyncRequestState;
```

### AsyncRequestStatus

- Kind: type
- Source: `packages/core/src/async/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type AsyncRequestStatus;
```

### AsyncRunOptions

- Kind: interface
- Source: `packages/core/src/async/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface AsyncRunOptions;
```

### BooleanValidationRules

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface BooleanValidationRules;
```

### CancelMutation

- Kind: interface
- Source: `packages/core/src/plugins/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CancelMutation;
```

### ChoiceFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ChoiceFieldConfig;
```

### CompiledDependencyGraph

- Kind: interface
- Source: `packages/core/src/schema/compilation.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CompiledDependencyGraph;
```

### CompiledFieldExplanation

- Kind: interface
- Source: `packages/core/src/schema/compilation.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CompiledFieldExplanation;
```

### CompiledFormSchema

- Kind: interface
- Source: `packages/core/src/schema/compilation.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CompiledFormSchema;
```

### compileSchema

- Kind: function
- Source: `packages/core/src/schema/compilation.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function compileSchema<TCustomValue = never>(input: FormSchema<TCustomValue> | unknown, options?: Omit<NormalizeSchemaOptions, "throwOnError">): SchemaCompileResult<TCustomValue>
```

### compileSchemaOrThrow

- Kind: function
- Source: `packages/core/src/schema/compilation.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function compileSchemaOrThrow<TCustomValue = never>(input: FormSchema<TCustomValue> | unknown, options?: Omit<NormalizeSchemaOptions, "throwOnError">): CompiledFormSchema<TCustomValue>
```

### Condition

- Kind: interface
- Source: `packages/core/src/conditions/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface Condition;
```

### ConditionController

- Kind: class
- Source: `packages/core/src/conditions/controller.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class ConditionController;
```

### ConditionGroup

- Kind: interface
- Source: `packages/core/src/conditions/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ConditionGroup;
```

### ConditionOperator

- Kind: type
- Source: `packages/core/src/conditions/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type ConditionOperator;
```

### ConditionStateEquality

- Kind: type
- Source: `packages/core/src/conditions/controller.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type ConditionStateEquality;
```

### ConditionStateListener

- Kind: type
- Source: `packages/core/src/conditions/controller.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type ConditionStateListener;
```

### ConditionStateSelector

- Kind: type
- Source: `packages/core/src/conditions/controller.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type ConditionStateSelector;
```

### CORE_PERFORMANCE_BUDGETS

- Kind: const
- Source: `packages/core/src/performance/budgets.ts`

Conservative CI guardrails, not expected averages. Benchmark output should be used for machine-specific comparisons and these limits catch major regressions.

```ts
export declare const CORE_PERFORMANCE_BUDGETS: Readonly<CorePerformanceBudgets>;
```

### CoreMutation

- Kind: type
- Source: `packages/core/src/plugins/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type CoreMutation;
```

### CorePerformanceBudgets

- Kind: interface
- Source: `packages/core/src/performance/budgets.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CorePerformanceBudgets;
```

### CorePlugin

- Kind: interface
- Source: `packages/core/src/plugins/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CorePlugin;
```

### CorePluginContext

- Kind: interface
- Source: `packages/core/src/plugins/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CorePluginContext;
```

### CorePluginError

- Kind: interface
- Source: `packages/core/src/plugins/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CorePluginError;
```

### CorePluginHook

- Kind: type
- Source: `packages/core/src/plugins/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type CorePluginHook;
```

### CorePluginHost

- Kind: class
- Source: `packages/core/src/plugins/host.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class CorePluginHost;
```

### createArrayItemValue

- Kind: function
- Source: `packages/core/src/schema/normalization.ts`

Creates a fresh default item for an array field using its normalized child schema.

```ts
export declare function createArrayItemValue(schema: NormalizedFormSchema<unknown>, arrayPath: string): unknown
```

### createFieldValidators

- Kind: function
- Source: `packages/core/src/validation/schemaValidators.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function createFieldValidators(field: FieldSchema, overrides?: FieldValidationOverrides): Validator[]
```

### createFormRuntime

- Kind: function
- Source: `packages/core/src/runtime/runtime.ts`

Construct a runtime whose value contract is inferred from a const schema. Use the FormRuntime constructor directly when supplying an explicit value type.

```ts
export declare function createFormRuntime<const TSchema extends FormSchema>(schema: TSchema, initialValues?: InferFormValues<TSchema>, options?: FormRuntimeOptions<InferFormValues<TSchema>>): FormRuntime<InferFormValues<TSchema>>
```

### createFormValidator

- Kind: function
- Source: `packages/core/src/validation/schemaValidators.ts`

Creates the authoritative client-side validator for a schema; servers must still validate submitted data.

```ts
export declare function createFormValidator(schema: FormSchema): FormValidator
```

### createInitialValues

- Kind: function
- Source: `packages/core/src/schema/normalization.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function createInitialValues(schema: NormalizedFormSchema<unknown>): FormValues
```

### createLifecycleAuditPlugin

- Kind: function
- Source: `packages/core/src/plugins/audit.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function createLifecycleAuditPlugin<TValues extends FormValues>(record: (entry: LifecycleAuditEntry) => void): CorePlugin<TValues>
```

### CurrencyFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface CurrencyFieldConfig;
```

### CURRENT_SCHEMA_VERSION

- Kind: const
- Source: `packages/core/src/schema/normalization.ts`

Public const exported by @dynamic-form-engine/core.

```ts
export declare const CURRENT_SCHEMA_VERSION: 1;
```

### DataSource

- Kind: type
- Source: `packages/core/src/datasource/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type DataSource;
```

### DataSourceConfig

- Kind: interface
- Source: `packages/core/src/datasource/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DataSourceConfig;
```

### DataSourceContext

- Kind: interface
- Source: `packages/core/src/datasource/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DataSourceContext;
```

### DataSourceLoadOptions

- Kind: interface
- Source: `packages/core/src/datasource/datasource.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DataSourceLoadOptions;
```

### DataSourceManager

- Kind: class
- Source: `packages/core/src/datasource/datasource.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class DataSourceManager;
```

### DataSourceManagerOptions

- Kind: interface
- Source: `packages/core/src/datasource/datasource.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DataSourceManagerOptions;
```

### DataSourceResult

- Kind: interface
- Source: `packages/core/src/datasource/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DataSourceResult;
```

### DateTimeFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DateTimeFieldConfig;
```

### defineFormSchema

- Kind: function
- Source: `packages/core/src/schema/types.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function defineFormSchema<const TFields extends readonly FormField[]>(schema: StrictFormSchema<TFields>): StrictFormSchema<TFields>
```

### definePortableFormSchema

- Kind: function
- Source: `packages/core/src/schema/types.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function definePortableFormSchema<const TFields extends readonly PortableFormField[]>(schema: PortableFormSchema<TFields>): PortableFormSchema<TFields>
```

### deleteByPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function deleteByPath<TValues, TPath extends Path<TValues>>(obj: TValues, path: TPath): TValues
export declare function deleteByPath<TValues>(obj: TValues, path: DynamicPath): TValues
```

### DependencyController

- Kind: class
- Source: `packages/core/src/dependencies/controller.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class DependencyController;
```

### DependencyControllerOptions

- Kind: interface
- Source: `packages/core/src/dependencies/controller.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DependencyControllerOptions;
```

### DependencyGraph

- Kind: class
- Source: `packages/core/src/dependencies/graph.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class DependencyGraph;
```

### DependencyRefreshContext

- Kind: interface
- Source: `packages/core/src/dependencies/controller.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface DependencyRefreshContext;
```

### DynamicFormValues

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type DynamicFormValues;
```

### dynamicPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function dynamicPath(path: string): DynamicPath
```

### DynamicPath

- Kind: type
- Source: `packages/core/src/store/paths.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type DynamicPath;
```

### EqualityFn

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type EqualityFn;
```

### evaluateCondition

- Kind: function
- Source: `packages/core/src/conditions/evaluate.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function evaluateCondition(condition: FieldCondition, values: object): boolean
```

### explainField

- Kind: function
- Source: `packages/core/src/schema/compilation.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function explainField<TCustomValue>(compiled: CompiledFormSchema<TCustomValue>, path: string): CompiledFieldExplanation<TCustomValue>
```

### FieldCondition

- Kind: type
- Source: `packages/core/src/conditions/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FieldCondition;
```

### FieldConditionState

- Kind: interface
- Source: `packages/core/src/conditions/controller.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FieldConditionState;
```

### FieldConfig

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FieldConfig;
```

### FieldConfigMap

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Exact configuration contract for each built-in value field.

```ts
export interface FieldConfigMap;
```

### FieldDefinition

- Kind: interface
- Source: `packages/core/src/registry/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FieldDefinition;
```

### FieldDependency

- Kind: interface
- Source: `packages/core/src/dependencies/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FieldDependency;
```

### FieldFileValue

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Framework-neutral representation of an uploaded file.

```ts
export interface FieldFileValue;
```

### FieldOption

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FieldOption;
```

### FieldOptionValue

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FieldOptionValue;
```

### FieldRegistry

- Kind: class
- Source: `packages/core/src/registry/registry.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class FieldRegistry;
```

### FieldSchema

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Declarative field contract shared by supported renderers.

```ts
export interface FieldSchema;
```

### FieldType

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FieldType;
```

### FieldValidation

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FieldValidation;
```

### FieldValidationOverrides

- Kind: interface
- Source: `packages/core/src/validation/schemaValidators.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FieldValidationOverrides;
```

### FieldValue

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FieldValue;
```

### FieldValueMap

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Value contract for every built-in field type. Extend through FieldValue's second generic.

```ts
export interface FieldValueMap;
```

### FileFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FileFieldConfig;
```

### FormErrors

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormErrors;
```

### FormEvent

- Kind: interface
- Source: `packages/core/src/events/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FormEvent;
```

### FormEventEmitter

- Kind: class
- Source: `packages/core/src/events/emitter.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class FormEventEmitter;
```

### FormEventListener

- Kind: type
- Source: `packages/core/src/events/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormEventListener;
```

### FormEventPayload

- Kind: type
- Source: `packages/core/src/events/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormEventPayload;
```

### FormEventType

- Kind: type
- Source: `packages/core/src/events/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormEventType;
```

### FormField

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormField;
```

### FormListener

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormListener;
```

### FormRuntime

- Kind: class
- Source: `packages/core/src/runtime/runtime.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class FormRuntime;
```

### FormRuntimeOptions

- Kind: interface
- Source: `packages/core/src/runtime/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FormRuntimeOptions;
```

### FormSchema

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Root declarative form contract. See the schema reference before accepting schemas across a trust boundary.

```ts
export interface FormSchema;
```

### FormSelector

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormSelector;
```

### FormState

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FormState;
```

### FormStore

- Kind: class
- Source: `packages/core/src/store/store.ts`

Framework-neutral observable form state and mutation boundary.

```ts
export class FormStore;
```

### FormStoreOptions

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface FormStoreOptions;
```

### FormSubmitHandler

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormSubmitHandler;
```

### FormValidator

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormValidator;
```

### FormValues

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type FormValues;
```

### getByPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function getByPath<TValues, TPath extends Path<TValues>>(obj: TValues, path: TPath): PathValue<TValues, TPath>
export declare function getByPath(obj: unknown, path: DynamicPath): unknown
```

### InferFormValues

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Infer form values from a const schema while retaining custom field-map support.

```ts
export type InferFormValues;
```

### InferSchemaType

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type InferSchemaType;
```

### isAbortError

- Kind: function
- Source: `packages/core/src/async/manager.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function isAbortError(error: unknown): boolean
```

### isAncestorPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function isAncestorPath(ancestor: string, descendant: string): boolean
```

### isDescendantPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function isDescendantPath(descendant: string, ancestor: string): boolean
```

### isSamePath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function isSamePath(left: string, right: string): boolean
```

### joinPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function joinPath(...parts: readonly string[]): string
```

### JsonPrimitive

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type JsonPrimitive;
```

### JsonValue

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type JsonValue;
```

### LifecycleAuditEntry

- Kind: interface
- Source: `packages/core/src/plugins/audit.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface LifecycleAuditEntry;
```

### MaskFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface MaskFieldConfig;
```

### mergeSchemaInitialValues

- Kind: function
- Source: `packages/core/src/schema/normalization.ts`

Schema defaults recursively merged beneath explicit runtime values. Arrays are replaced, not index-merged.

```ts
export declare function mergeSchemaInitialValues<T extends FormValues>(schema: NormalizedFormSchema<unknown>, initialValues: Partial<T>): T
```

### MutationInterceptorResult

- Kind: type
- Source: `packages/core/src/plugins/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type MutationInterceptorResult;
```

### normalizeAsyncError

- Kind: function
- Source: `packages/core/src/async/manager.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function normalizeAsyncError(error: unknown): Error
```

### NormalizedFieldSchema

- Kind: type
- Source: `packages/core/src/schema/normalization.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type NormalizedFieldSchema;
```

### NormalizedFormSchema

- Kind: interface
- Source: `packages/core/src/schema/normalization.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface NormalizedFormSchema;
```

### normalizePath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function normalizePath(path: string): string
```

### normalizeSchema

- Kind: function
- Source: `packages/core/src/schema/normalization.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function normalizeSchema<TCustomValue = never>(input: FormSchema<TCustomValue> | unknown, options?: NormalizeSchemaOptions): SchemaNormalizationResult<TCustomValue>
```

### NormalizeSchemaOptions

- Kind: interface
- Source: `packages/core/src/schema/normalization.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface NormalizeSchemaOptions;
```

### normalizeSchemaOrThrow

- Kind: function
- Source: `packages/core/src/schema/normalization.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function normalizeSchemaOrThrow<TCustomValue = never>(schema: FormSchema<TCustomValue> | unknown, options?: Omit<NormalizeSchemaOptions, "throwOnError">): NormalizedFormSchema<TCustomValue>
```

### NumberValidationRules

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface NumberValidationRules;
```

### NumericFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface NumericFieldConfig;
```

### ObjectFieldSchema

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ObjectFieldSchema;
```

### parentPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function parentPath(path: string): string | undefined
```

### parsePath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function parsePath(path: string): readonly string[]
```

### Path

- Kind: type
- Source: `packages/core/src/store/paths.ts`

Dot and bracket paths for known values. Broad runtime records intentionally accept string.

```ts
export type Path;
```

### PathValue

- Kind: type
- Source: `packages/core/src/store/paths.ts`

Value resolved at a known path. Dynamic strings deliberately resolve to unknown.

```ts
export type PathValue;
```

### PortableDataSourceConfig

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type PortableDataSourceConfig;
```

### PortableFieldOption

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface PortableFieldOption;
```

### PortableFormField

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type PortableFormField;
```

### PortableFormSchema

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface PortableFormSchema;
```

### RangeFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Framework-neutral configuration for range values.

```ts
export interface RangeFieldConfig;
```

### RegistryOptions

- Kind: interface
- Source: `packages/core/src/registry/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface RegistryOptions;
```

### ResetOptions

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ResetOptions;
```

### RUNTIME_LIFECYCLE_PHASES

- Kind: const
- Source: `packages/core/src/runtime/types.ts`

Public const exported by @dynamic-form-engine/core.

```ts
export declare const RUNTIME_LIFECYCLE_PHASES: readonly ["mutation", "dependencies", "conditions", "events", "notification", "dataSource", "validation"];
```

### RuntimeLifecycleEvent

- Kind: interface
- Source: `packages/core/src/runtime/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface RuntimeLifecycleEvent;
```

### RuntimeLifecycleListener

- Kind: type
- Source: `packages/core/src/runtime/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type RuntimeLifecycleListener;
```

### RuntimeLifecyclePhase

- Kind: type
- Source: `packages/core/src/runtime/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type RuntimeLifecyclePhase;
```

### RuntimeOperation

- Kind: type
- Source: `packages/core/src/runtime/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type RuntimeOperation;
```

### SchemaCompileResult

- Kind: interface
- Source: `packages/core/src/schema/compilation.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface SchemaCompileResult;
```

### SchemaDiagnostic

- Kind: interface
- Source: `packages/core/src/schema/normalization.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface SchemaDiagnostic;
```

### SchemaDiagnosticCode

- Kind: type
- Source: `packages/core/src/schema/normalization.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type SchemaDiagnosticCode;
```

### SchemaMigration

- Kind: interface
- Source: `packages/core/src/schema/normalization.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface SchemaMigration;
```

### SchemaNormalizationError

- Kind: class
- Source: `packages/core/src/schema/normalization.ts`

Public class exported by @dynamic-form-engine/core.

```ts
export class SchemaNormalizationError;
```

### SchemaNormalizationResult

- Kind: interface
- Source: `packages/core/src/schema/normalization.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface SchemaNormalizationResult;
```

### SchemaValidationCode

- Kind: type
- Source: `packages/core/src/schema/validation.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type SchemaValidationCode;
```

### SchemaValidationError

- Kind: interface
- Source: `packages/core/src/schema/validation.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface SchemaValidationError;
```

### SchemaValidationResult

- Kind: interface
- Source: `packages/core/src/schema/validation.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface SchemaValidationResult;
```

### SegmentedFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Framework-neutral configuration for OTP and PIN controls.

```ts
export interface SegmentedFieldConfig;
```

### SelectorListener

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type SelectorListener;
```

### setByPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function setByPath<TValues, TPath extends Path<TValues>>(obj: TValues, path: TPath, value: PathValue<TValues, TPath>): TValues
export declare function setByPath<TValues>(obj: TValues, path: DynamicPath, value: unknown): TValues
```

### SetValueOptions

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface SetValueOptions;
```

### StrictFormSchema

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Strict persisted-schema authoring contract. Use FieldSchema for registered programmatic custom controls.

```ts
export interface StrictFormSchema;
```

### StringValidationRules

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface StringValidationRules;
```

### TextFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface TextFieldConfig;
```

### validateField

- Kind: function
- Source: `packages/core/src/validation/validator.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function validateField<T>(field: string, value: T, values: Record<string, unknown>, validators?: Validator<T>[]): Promise<ValidationResult>
```

### ValidateOptions

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ValidateOptions;
```

### validateSchema

- Kind: function
- Source: `packages/core/src/schema/validation.ts`

Public function exported by @dynamic-form-engine/core.

```ts
export declare function validateSchema(schema: FormSchema<unknown>): SchemaValidationResult
```

### ValidationError

- Kind: interface
- Source: `packages/core/src/validation/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ValidationError;
```

### ValidationIssue

- Kind: interface
- Source: `packages/core/src/validation/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ValidationIssue;
```

### ValidationResult

- Kind: interface
- Source: `packages/core/src/validation/types.ts`

Public interface exported by @dynamic-form-engine/core.

```ts
export interface ValidationResult;
```

### Validator

- Kind: type
- Source: `packages/core/src/validation/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type Validator;
```

### ValidatorResult

- Kind: type
- Source: `packages/core/src/validation/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type ValidatorResult;
```

### ValueFieldSchema

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @dynamic-form-engine/core.

```ts
export type ValueFieldSchema;
```

### VERSION

- Kind: const
- Source: `packages/core/src/index.ts`

Public const exported by @dynamic-form-engine/core.

```ts
export declare const VERSION: "0.1.0";
```

### YearFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Framework-neutral configuration for year controls.

```ts
export interface YearFieldConfig;
```

## Deprecations

No exported symbol currently carries a `@deprecated` tag. When one is added, this page displays its replacement and removal target.

