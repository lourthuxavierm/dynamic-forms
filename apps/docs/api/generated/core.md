# @lourthuxavierm/dynamic-forms-core API

<!-- GENERATED FILE. Run pnpm docs:api to update. -->

- Maturity: Implemented
- Source: TypeScript public exports
- Internal symbols: excluded

Framework-independent schema, state, validation, conditions, dependencies, data sources, and lifecycle contracts.

Related: [guide](../../runtime/) · [controls/examples](../../playground/)

## Public exports

This page contains 69 exports. Signatures are regenerated from the package entry point.

### ArrayFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Framework-neutral constraints for array structural fields.

```ts
export interface ArrayFieldConfig;
```

### ChoiceFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface ChoiceFieldConfig;
```

### Condition

- Kind: interface
- Source: `packages/core/src/conditions/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface Condition;
```

### ConditionController

- Kind: class
- Source: `packages/core/src/conditions/controller.ts`

Public class exported by @lourthuxavierm/dynamic-forms-core.

```ts
export class ConditionController;
```

### ConditionGroup

- Kind: interface
- Source: `packages/core/src/conditions/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface ConditionGroup;
```

### ConditionOperator

- Kind: type
- Source: `packages/core/src/conditions/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type ConditionOperator;
```

### createFieldValidators

- Kind: function
- Source: `packages/core/src/validation/schemaValidators.ts`

Public function exported by @lourthuxavierm/dynamic-forms-core.

```ts
export declare function createFieldValidators(field: FieldSchema, overrides?: FieldValidationOverrides): Validator[]
```

### createFormValidator

- Kind: function
- Source: `packages/core/src/validation/schemaValidators.ts`

Creates the authoritative client-side validator for a schema; servers must still validate submitted data.

```ts
export declare function createFormValidator(schema: FormSchema): FormValidator
```

### CurrencyFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface CurrencyFieldConfig;
```

### DataSource

- Kind: type
- Source: `packages/core/src/datasource/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type DataSource;
```

### DataSourceConfig

- Kind: interface
- Source: `packages/core/src/datasource/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface DataSourceConfig;
```

### DataSourceContext

- Kind: interface
- Source: `packages/core/src/datasource/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface DataSourceContext;
```

### DataSourceLoadOptions

- Kind: interface
- Source: `packages/core/src/datasource/datasource.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface DataSourceLoadOptions;
```

### DataSourceManager

- Kind: class
- Source: `packages/core/src/datasource/datasource.ts`

Public class exported by @lourthuxavierm/dynamic-forms-core.

```ts
export class DataSourceManager;
```

### DataSourceManagerOptions

- Kind: interface
- Source: `packages/core/src/datasource/datasource.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface DataSourceManagerOptions;
```

### DataSourceResult

- Kind: interface
- Source: `packages/core/src/datasource/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface DataSourceResult;
```

### DateTimeFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface DateTimeFieldConfig;
```

### deleteByPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @lourthuxavierm/dynamic-forms-core.

```ts
export declare function deleteByPath(obj: any, path: string): any
```

### DependencyController

- Kind: class
- Source: `packages/core/src/dependencies/controller.ts`

Public class exported by @lourthuxavierm/dynamic-forms-core.

```ts
export class DependencyController;
```

### DependencyControllerOptions

- Kind: interface
- Source: `packages/core/src/dependencies/controller.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface DependencyControllerOptions;
```

### DependencyGraph

- Kind: class
- Source: `packages/core/src/dependencies/graph.ts`

Public class exported by @lourthuxavierm/dynamic-forms-core.

```ts
export class DependencyGraph;
```

### evaluateCondition

- Kind: function
- Source: `packages/core/src/conditions/evaluate.ts`

Public function exported by @lourthuxavierm/dynamic-forms-core.

```ts
export declare function evaluateCondition(condition: FieldCondition, values: Record<string, unknown>): boolean
```

### FieldCondition

- Kind: type
- Source: `packages/core/src/conditions/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FieldCondition;
```

### FieldConditionState

- Kind: interface
- Source: `packages/core/src/conditions/controller.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FieldConditionState;
```

### FieldConfig

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FieldConfig;
```

### FieldDefinition

- Kind: interface
- Source: `packages/core/src/registry/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FieldDefinition;
```

### FieldDependency

- Kind: interface
- Source: `packages/core/src/dependencies/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FieldDependency;
```

### FieldOption

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FieldOption;
```

### FieldRegistry

- Kind: class
- Source: `packages/core/src/registry/registry.ts`

Public class exported by @lourthuxavierm/dynamic-forms-core.

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

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FieldType;
```

### FieldValidation

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FieldValidation;
```

### FieldValidationOverrides

- Kind: interface
- Source: `packages/core/src/validation/schemaValidators.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FieldValidationOverrides;
```

### FieldValue

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FieldValue;
```

### FileFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FileFieldConfig;
```

### FormErrors

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FormErrors;
```

### FormEvent

- Kind: interface
- Source: `packages/core/src/events/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface FormEvent;
```

### FormEventEmitter

- Kind: class
- Source: `packages/core/src/events/emitter.ts`

Public class exported by @lourthuxavierm/dynamic-forms-core.

```ts
export class FormEventEmitter;
```

### FormEventListener

- Kind: type
- Source: `packages/core/src/events/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FormEventListener;
```

### FormEventType

- Kind: type
- Source: `packages/core/src/events/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FormEventType;
```

### FormListener

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FormListener;
```

### FormSchema

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Root declarative form contract. See the schema reference before accepting schemas across a trust boundary.

```ts
export interface FormSchema;
```

### FormState

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

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

### FormSubmitHandler

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FormSubmitHandler;
```

### FormValidator

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FormValidator;
```

### FormValues

- Kind: type
- Source: `packages/core/src/store/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type FormValues;
```

### getByPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Simple path utilities for getting and setting values in nested objects. This avoids a heavy dependency like lodash if we only need these basic operations.

```ts
export declare function getByPath(obj: any, path: string): any
```

### InferSchemaType

- Kind: type
- Source: `packages/core/src/schema/types.ts`

Helper to infer the TypeScript type of form values from a schema. Note: This is a simplified version and might need refinement for complex schemas.

```ts
export type InferSchemaType;
```

### MaskFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface MaskFieldConfig;
```

### NumericFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface NumericFieldConfig;
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

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface RegistryOptions;
```

### ResetOptions

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface ResetOptions;
```

### SchemaValidationError

- Kind: interface
- Source: `packages/core/src/schema/validation.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface SchemaValidationError;
```

### SchemaValidationResult

- Kind: interface
- Source: `packages/core/src/schema/validation.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

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

### setByPath

- Kind: function
- Source: `packages/core/src/store/paths.ts`

Public function exported by @lourthuxavierm/dynamic-forms-core.

```ts
export declare function setByPath(obj: any, path: string, value: any): any
```

### SetValueOptions

- Kind: interface
- Source: `packages/core/src/store/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface SetValueOptions;
```

### TextFieldConfig

- Kind: interface
- Source: `packages/core/src/schema/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface TextFieldConfig;
```

### validateField

- Kind: function
- Source: `packages/core/src/validation/validator.ts`

Public function exported by @lourthuxavierm/dynamic-forms-core.

```ts
export declare function validateField<T>(field: string, value: T, values: Record<string, unknown>, validators?: Validator<T>[]): Promise<ValidationResult>
```

### validateSchema

- Kind: function
- Source: `packages/core/src/schema/validation.ts`

Public function exported by @lourthuxavierm/dynamic-forms-core.

```ts
export declare function validateSchema(schema: FormSchema): SchemaValidationResult
```

### ValidationError

- Kind: interface
- Source: `packages/core/src/validation/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface ValidationError;
```

### ValidationIssue

- Kind: interface
- Source: `packages/core/src/validation/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface ValidationIssue;
```

### ValidationResult

- Kind: interface
- Source: `packages/core/src/validation/types.ts`

Public interface exported by @lourthuxavierm/dynamic-forms-core.

```ts
export interface ValidationResult;
```

### Validator

- Kind: type
- Source: `packages/core/src/validation/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type Validator;
```

### ValidatorResult

- Kind: type
- Source: `packages/core/src/validation/types.ts`

Public type exported by @lourthuxavierm/dynamic-forms-core.

```ts
export type ValidatorResult;
```

### VERSION

- Kind: const
- Source: `packages/core/src/index.ts`

Public const exported by @lourthuxavierm/dynamic-forms-core.

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

