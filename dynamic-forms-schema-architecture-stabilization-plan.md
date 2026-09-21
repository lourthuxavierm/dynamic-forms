# Dynamic Forms Core — Schema Architecture Stabilization Plan

> Package: `@dynamic-form-engine/core`  
> Target: Stable `1.0.0`  
> Scope: Schema architecture only  
> Status: Implementation roadmap  
> Priority: P0/P1 before stable 1.0

---

## 1. Objective

The schema is the long-term public contract of the Dynamic Forms engine.

It must remain:

- Framework-independent
- Renderer-independent
- Strongly typed
- Versioned
- Validatable
- Normalizable
- Compilable
- Immutable
- Extensible
- Backward-compatible
- Efficient at runtime
- Friendly to builders, DevTools, JSON serialization, and adapters

The target architecture is:

```text
Public FormSchema
       │
       ▼
Schema Version Check
       │
       ▼
validateSchema()
       │
       ▼
normalizeSchema()
       │
       ▼
NormalizedFormSchema
       │
       ▼
compileSchema()
       │
       ▼
CompiledFormSchema
       │
       ├── Field Index
       ├── Dependency Graph
       ├── Condition Index
       ├── DataSource Index
       ├── Validation Metadata
       ├── Default Value Metadata
       └── Diagnostics
       │
       ▼
FormRuntime
       │
       ├── FormStore
       ├── Conditions
       ├── Dependencies
       ├── DataSources
       ├── Validation
       ├── Plugins
       └── Events
```

The runtime should not repeatedly interpret the raw public schema.

---

# 2. Stabilization Priorities

| Priority | Meaning | Release requirement |
|---|---|---|
| P0 | Contract/correctness critical | Must complete before 1.0 |
| P1 | Production stability | Strongly recommended before 1.0 |
| P2 | Useful enhancement | Can follow 1.0 |
| P3 | Future optimization | Post-1.0 |

---

# 3. Schema Versioning — P0

## 3.1 Add `schemaVersion`

Every persisted schema needs an explicit version.

```ts
export interface FormSchema<
  TFields extends readonly FormField[] = readonly FormField[]
> {
  schemaVersion: 1;
  id: string;
  fields: TFields;
}
```

Example:

```ts
const schema = {
  schemaVersion: 1,
  id: 'customer-registration',
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First name'
    }
  ]
} as const satisfies FormSchema;
```

## 3.2 Version rules

The Core must define:

- supported schema versions
- current schema version
- behavior for missing versions
- behavior for unsupported future versions
- behavior for obsolete versions
- migration strategy

Recommended exports:

```ts
export const CURRENT_SCHEMA_VERSION = 1 as const;

export type SchemaVersion = 1;
```

## 3.3 Unsupported version diagnostic

Example:

```text
SCHEMA_UNSUPPORTED_VERSION

Schema version 4 is not supported by this version of
@dynamic-form-engine/core.
```

## 3.4 Acceptance criteria

- [ ] `schemaVersion` exists on public persisted schemas
- [ ] Current version is exported
- [ ] Unsupported versions fail deterministically
- [ ] Error contains a stable diagnostic code
- [ ] Version behavior is documented
- [ ] Version tests exist

---

# 4. Public Schema vs Internal Schema — P0

Do not use one interface for both authoring and runtime execution.

Create three levels.

## 4.1 Public schema

Human/builder-facing configuration.

```ts
FormSchema
FormField
Condition
Dependency
DataSourceConfig
ValidationRules
```

It should be ergonomic and serializable.

## 4.2 Normalized schema

Canonical representation after defaults and syntax normalization.

```ts
NormalizedFormSchema
NormalizedField
NormalizedCondition
NormalizedDependency
NormalizedDataSource
```

## 4.3 Compiled schema

Optimized runtime representation.

```ts
CompiledFormSchema
```

This can contain Maps, indexes and graph structures that do not need to be JSON serializable.

## 4.4 Rule

```text
Public API       = ergonomic
Normalized API   = deterministic
Compiled API     = runtime optimized
```

Do not expose compiled internals as a stable public contract unless necessary.

---

# 5. Schema Validation Pipeline — P0

Use explicit stages.

```ts
validateSchema(schema);
normalizeSchema(schema);
compileSchema(schema);
```

Recommended high-level API:

```ts
export function compileSchema(
  schema: FormSchema
): SchemaCompileResult;
```

Internally:

```text
compileSchema()
    │
    ├── checkVersion()
    ├── validateStructure()
    ├── normalizeSchema()
    ├── validateReferences()
    ├── buildIndexes()
    ├── compileConditions()
    ├── compileDependencyGraph()
    ├── compileDataSources()
    ├── compileValidation()
    └── freezeCompiledSchema()
```

---

# 6. Schema Diagnostics — P0

Move from message-only validation errors to structured diagnostics.

## 6.1 Diagnostic contract

```ts
export type SchemaDiagnosticSeverity =
  | 'error'
  | 'warning'
  | 'info';

export interface SchemaDiagnostic {
  code: SchemaDiagnosticCode;
  severity: SchemaDiagnosticSeverity;
  path: string;
  message: string;
  relatedPath?: string;
  details?: Readonly<Record<string, unknown>>;
}
```

## 6.2 Stable diagnostic codes

Start with codes such as:

```ts
export type SchemaDiagnosticCode =
  | 'SCHEMA_INVALID'
  | 'SCHEMA_VERSION_MISSING'
  | 'SCHEMA_UNSUPPORTED_VERSION'
  | 'FIELD_NAME_EMPTY'
  | 'FIELD_NAME_INVALID'
  | 'FIELD_DUPLICATE'
  | 'FIELD_TYPE_INVALID'
  | 'FIELD_CHILDREN_NOT_ALLOWED'
  | 'FIELD_CHILDREN_REQUIRED'
  | 'FIELD_REFERENCE_NOT_FOUND'
  | 'VALIDATION_RANGE_INVALID'
  | 'VALIDATION_PATTERN_INVALID'
  | 'OPTION_DUPLICATE_VALUE'
  | 'CONDITION_REFERENCE_NOT_FOUND'
  | 'DEPENDENCY_REFERENCE_NOT_FOUND'
  | 'DEPENDENCY_SELF_REFERENCE'
  | 'DEPENDENCY_CYCLE'
  | 'DATASOURCE_INVALID'
  | 'DATASOURCE_PARAMETER_REFERENCE_NOT_FOUND'
  | 'DEFAULT_VALUE_TYPE_MISMATCH';
```

## 6.3 Error vs warning

Errors prevent compilation.

Examples:

- duplicate field path
- invalid regex
- invalid field type
- missing referenced field
- dependency cycle
- malformed datasource
- invalid schema version

Warnings do not prevent compilation.

Examples:

- select has neither options nor datasource
- label is missing
- hidden + required combination may be surprising
- unused metadata
- deprecated property used

## 6.4 Result contract

```ts
export interface SchemaValidationResult {
  valid: boolean;
  diagnostics: readonly SchemaDiagnostic[];
}
```

## 6.5 Acceptance criteria

- [ ] Every validation failure has a stable code
- [ ] Errors and warnings are distinguishable
- [ ] Diagnostics identify schema path
- [ ] Related field/reference can be reported
- [ ] Builder/DevTools can consume diagnostics without parsing text

---

# 7. Schema Normalization — P0

Implement:

```ts
normalizeSchema(schema: FormSchema): NormalizedFormSchema
```

Normalization must produce one deterministic internal representation.

## 7.1 Normalize

Normalize at least:

- schema version
- field paths
- field defaults
- validation rules
- conditions
- dependencies
- options
- datasource configuration
- structural children
- metadata
- boolean defaults
- empty collections
- deprecated aliases

## 7.2 Example

Public:

```ts
{
  name: 'country',
  type: 'select',
  required: true
}
```

Normalized representation may become:

```ts
{
  path: 'country',
  name: 'country',
  type: 'select',
  validation: {
    required: true
  },
  conditions: {},
  dependencies: [],
  options: [],
  metadata: {}
}
```

Runtime code now handles one shape instead of many optional combinations.

## 7.3 Normalization properties

Normalization should be:

- deterministic
- idempotent
- side-effect free
- non-mutating

Idempotence goal:

```ts
normalizeSchema(normalizeSchema(schema))
```

should be semantically equivalent to:

```ts
normalizeSchema(schema)
```

---

# 8. Canonical Field Paths — P0

Use one path format across:

- Store
- Schema
- Conditions
- Dependencies
- Validation
- DataSources
- Diagnostics
- Events
- DevTools

Recommended canonical form:

```text
customer.name
customer.address.city
orders.0.product
orders.0.quantity
```

## 8.1 Path utilities

Centralize:

```ts
normalizePath()
joinPath()
parentPath()
isSamePath()
isAncestorPath()
isDescendantPath()
parsePath()
```

Avoid separate path parsing implementations in different modules.

## 8.2 Array syntax

If public APIs accept:

```text
items[0].name
```

normalize internally to:

```text
items.0.name
```

Do not keep multiple internal path formats.

## 8.3 Acceptance criteria

- [ ] One canonical internal syntax
- [ ] Store and schema use same semantics
- [ ] Nested object paths tested
- [ ] Nested array paths tested
- [ ] Mixed object/array paths tested
- [ ] Invalid paths produce diagnostics

---

# 9. Field Identity vs Data Path — P1

A builder needs stable identity independent of a field's data name.

Recommended:

```ts
export interface BaseFieldSchema {
  id?: string;
  name: string;
  type: FieldType;
}
```

`name`:

```text
Data binding identity
```

`id`:

```text
Builder/design identity
```

Example:

```ts
{
  id: 'fld_01J...',
  name: 'billingAddress',
  type: 'object'
}
```

If the user renames:

```text
billingAddress → invoiceAddress
```

the builder can still identify the same field by `id`.

Useful for:

- drag/drop
- undo/redo
- builder selection
- diagnostics
- analytics
- schema diff
- migrations

Core should not require generated IDs unless there is a strong runtime need.

---

# 10. Discriminated Field Schema — P0

Avoid a giant field interface with unrelated optional properties.

Use:

```ts
export type FormField =
  | TextField
  | TextareaField
  | NumberField
  | SelectField
  | CheckboxField
  | RadioField
  | DateField
  | ObjectField
  | ArrayField;
```

Example base:

```ts
interface BaseField<TType extends string> {
  id?: string;
  name: string;
  type: TType;
  label?: string;
  description?: string;
}
```

Text:

```ts
interface TextField extends BaseField<'text'> {
  defaultValue?: string;
  validation?: StringValidationRules;
}
```

Number:

```ts
interface NumberField extends BaseField<'number'> {
  defaultValue?: number | null;
  validation?: NumberValidationRules;
}
```

Select:

```ts
interface SelectField extends BaseField<'select'> {
  defaultValue?: string | number | null;
  options?: readonly FieldOption[];
  dataSource?: DataSourceConfig;
}
```

## 10.1 Benefits

- invalid configurations fail in TypeScript
- autocomplete improves
- renderer contracts improve
- default values become type-specific
- validation becomes type-specific
- JSON schema conversion becomes easier

---

# 11. Structural Fields — P0

Treat structural fields separately.

```text
Value fields
├── text
├── number
├── email
├── select
├── checkbox
└── date

Structural fields
├── object
└── array
```

## 11.1 Object

```ts
interface ObjectField<
  TFields extends readonly FormField[] = readonly FormField[]
> extends BaseField<'object'> {
  fields: TFields;
}
```

## 11.2 Array

Prefer an explicit item schema.

```ts
interface ArrayField extends BaseField<'array'> {
  item: FormField | ObjectItemSchema;
  validation?: ArrayValidationRules;
}
```

Example:

```ts
{
  name: 'addresses',
  type: 'array',
  item: {
    type: 'object',
    fields: [
      {
        name: 'street',
        type: 'text'
      },
      {
        name: 'city',
        type: 'text'
      }
    ]
  }
}
```

Expected values:

```ts
{
  addresses: [
    {
      street: '...',
      city: '...'
    }
  ]
}
```

## 11.3 Decide before 1.0

Freeze whether arrays use:

```ts
fields
```

or:

```ts
item
```

Do not publish ambiguous array semantics in stable 1.0.

---

# 12. Default Value Architecture — P0

Define exactly where initial values come from.

Recommended precedence:

```text
Runtime initialValues
        ↓ overrides
Schema defaultValue
        ↓ overrides
Field-type default
```

Example:

```ts
new FormRuntime({
  schema,
  initialValues: {
    country: 'IN'
  }
});
```

If schema says:

```ts
defaultValue: 'US'
```

runtime value should be:

```text
IN
```

## 12.1 Define defaults for types

Examples:

```text
text           → ''
number         → null
checkbox       → false
multi-select   → []
object         → {}
array          → []
```

Whether Core should automatically create these defaults must be explicitly decided and documented.

## 12.2 Nested defaults

Test:

```ts
customer.address.city
items[].quantity
```

## 12.3 Reset semantics

Freeze behavior for:

```ts
reset()
resetField()
initialValues
schema defaultValue
dynamic array item creation
```

---

# 13. Option Architecture — P1

Define one stable option contract.

```ts
export interface FieldOption<TValue = unknown> {
  value: TValue;
  label: string;
  disabled?: boolean;
  metadata?: Readonly<Record<string, unknown>>;
  children?: readonly FieldOption<TValue>[];
}
```

Need to define:

- primitive value support
- duplicate value behavior
- nested options
- disabled options
- serialization rules
- value equality

Avoid framework-specific values/elements in Core options.

---

# 14. Validation Schema Architecture — P0

Core remains validator-agnostic.

```text
FormSchema
    │
    ▼
Declarative Core validation rules
    │
    ▼
Core FormValidator contract
    │
    ├── built-in validator
    ├── Zod adapter
    ├── future Yup adapter
    └── custom validator
```

Do not add:

```ts
zodSchema: z.string()
```

inside Core schema.

## 14.1 Type-specific validation

String:

```ts
interface StringValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}
```

Number:

```ts
interface NumberValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  multipleOf?: number;
}
```

Array:

```ts
interface ArrayValidationRules {
  required?: boolean;
  minItems?: number;
  maxItems?: number;
}
```

## 14.2 Cross-field validation

Define a clean extension mechanism instead of coupling it to a renderer.

## 14.3 Async validation

Schema metadata may identify validation intent, while execution remains in the validation abstraction.

---

# 15. Condition Architecture — P0

All condition types should normalize into one internal AST.

Example:

```ts
export type NormalizedCondition =
  | ComparisonCondition
  | AndCondition
  | OrCondition
  | NotCondition;
```

Comparison:

```ts
interface ComparisonCondition {
  kind: 'comparison';
  field: string;
  operator:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'empty'
    | 'notEmpty';
  value?: unknown;
}
```

Group:

```ts
interface AndCondition {
  kind: 'and';
  conditions: readonly NormalizedCondition[];
}
```

## 15.1 Field condition contract

Prefer:

```ts
conditions?: {
  visible?: Condition;
  disabled?: Condition;
  readonly?: Condition;
  required?: Condition;
}
```

rather than separate unrelated condition models.

## 15.2 Freeze semantics

Before 1.0 document:

- hidden + required
- disabled + required
- readonly + validation
- missing reference value
- `null`
- `undefined`
- `false`
- `0`
- `''`
- `[]`

Also decide:

- does hiding clear value?
- does hiding preserve errors?
- does disabled field validate?
- does hidden field submit?
- does hiding cancel datasource requests?

---

# 16. Dependency Architecture — P0

Dependencies represent effects caused by another field changing.

Do not confuse them with conditions.

Condition:

```text
Show state when country = IN
```

Dependency:

```text
Reload state options when country changes
```

Recommended conceptual model:

```ts
interface FieldDependency {
  source: string;
  effect: DependencyEffect;
}
```

Possible effects:

```ts
type DependencyEffect =
  | 'reloadDataSource'
  | 'revalidate'
  | 'recompute'
  | 'reset';
```

Only expose effects Core can guarantee long-term.

---

# 17. Dependency Graph Compilation — P0

Compile dependencies once.

```ts
interface CompiledDependencyGraph {
  dependenciesByField: ReadonlyMap<string, readonly string[]>;
  dependentsByField: ReadonlyMap<string, readonly string[]>;
}
```

## 17.1 Detect full cycles

Reject:

```text
A → B
B → C
C → A
```

Not only:

```text
A → A
```

Use DFS/Tarjan/Kahn as appropriate.

Diagnostic:

```text
DEPENDENCY_CYCLE

Circular dependency detected:
country → state → city → country
```

## 17.2 Test

- [ ] direct self-cycle
- [ ] two-node cycle
- [ ] three-node cycle
- [ ] deeply nested cycle
- [ ] valid chain
- [ ] diamond graph
- [ ] disconnected graphs

---

# 18. Cross-Reference Validation — P0

All references should be resolved before runtime.

Validate:

```text
conditions
dependencies
datasource parameters
computed dependencies
cross-field validation references
default references, if supported
```

Example:

```ts
{
  field: 'city',
  condition: {
    field: 'counrty',
    operator: 'eq',
    value: 'IN'
  }
}
```

should fail during compilation because `counrty` does not exist.

Do not wait until the user changes a value.

---

# 19. DataSource Schema Architecture — P0/P1

Keep datasource configuration framework-independent.

Conceptually support:

```text
static
function
API/URL
search
pagination
dependent parameters
cache
```

Normalize every public datasource into a deterministic internal config.

## 19.1 Parameter references

Example:

```ts
params: {
  country: {
    fromField: 'country'
  }
}
```

Compile these references.

## 19.2 Validate

- missing URL where required
- missing loader
- unknown source field
- invalid pagination configuration
- invalid debounce values
- conflicting cache configuration

## 19.3 Runtime-only objects

Functions cannot be represented in JSON. Clearly distinguish:

```text
Serializable schema datasource
```

from:

```text
Programmatic runtime datasource
```

if both are supported.

---

# 20. Serializable Schema Contract — P0

Because this project targets form builders and stored schemas, define what is JSON-safe.

A persisted schema should ideally survive:

```ts
const restored = JSON.parse(JSON.stringify(schema));
```

Avoid requiring:

- React components
- Angular classes
- Vue components
- DOM elements
- Symbols
- class instances
- functions

inside the portable schema contract.

If programmatic extensions are supported, clearly separate them from portable schema.

---

# 21. Renderer Independence — P0

Core schema must never contain framework-specific properties such as:

```ts
reactComponent
muiProps
angularComponent
vueComponent
render
jsx
```

Core may support renderer-neutral presentation hints where justified.

Example:

```ts
ui?: {
  placeholder?: string;
  order?: number;
  span?: number;
}
```

However, keep Core UI metadata minimal.

Renderer-specific configuration belongs in renderer namespaces/extensions.

---

# 22. Extension Architecture — P1

Do not continually add vendor-specific properties to `FormField`.

Use namespaced extensions.

```ts
interface BaseFieldSchema {
  extensions?: Readonly<Record<string, unknown>>;
}
```

Example:

```ts
extensions: {
  '@dynamic-form-engine/react-html': {
    autocomplete: 'email'
  },

  'my-company': {
    auditCode: 'CUSTOMER_EMAIL'
  }
}
```

Define:

- namespace rules
- collision behavior
- serialization behavior
- whether Core ignores unknown extensions
- whether extension validators can be registered

---

# 23. Metadata Architecture — P1

Separate generic metadata from executable behavior.

```ts
metadata?: Readonly<Record<string, unknown>>;
```

Metadata can support:

- analytics IDs
- business tags
- audit references
- builder metadata

Core should not interpret arbitrary metadata.

---

# 24. Schema Immutability — P0

Never mutate the caller's schema.

These operations must not change input:

```ts
validateSchema(schema)
normalizeSchema(schema)
compileSchema(schema)
new FormRuntime(...)
```

Test:

```ts
const before = structuredClone(schema);

compileSchema(schema);

expect(schema).toEqual(before);
```

Consider deep-freezing normalized/compiled structures in development or as part of compilation, but benchmark the cost.

---

# 25. Compiled Schema — P0

Introduce a dedicated runtime representation.

Example:

```ts
export interface CompiledFormSchema<TValues = unknown> {
  readonly version: 1;
  readonly id: string;

  readonly normalized: NormalizedFormSchema;

  readonly fieldsByPath:
    ReadonlyMap<string, NormalizedField>;

  readonly dependencyGraph:
    CompiledDependencyGraph;

  readonly conditionIndex:
    CompiledConditionIndex;

  readonly dataSourceIndex:
    CompiledDataSourceIndex;

  readonly diagnostics:
    readonly SchemaDiagnostic[];
}
```

Internal details can remain non-public.

---

# 26. Field Index — P0

Build once:

```ts
Map<FieldPath, NormalizedField>
```

Example:

```text
customer.name       → TextField
customer.email      → EmailField
address.country     → SelectField
address.state       → SelectField
items.quantity      → NumberField template
```

Avoid recursive schema scanning during every runtime operation.

---

# 27. Condition Index — P1

Build reverse indexes.

Example:

```text
country changes
    ↓
conditions affected:
    state.visible
    state.required
    city.disabled
```

Concept:

```ts
conditionsBySourcePath:
  Map<string, readonly CompiledConditionTarget[]>
```

This enables fine-grained updates.

---

# 28. DataSource Index — P1

Compile:

```text
field path → datasource
source path → dependent datasources
```

Example:

```text
country changes
   ↓
state datasource invalidated

state changes
   ↓
city datasource invalidated
```

Runtime should not scan all fields.

---

# 29. Validation Index — P1

Compile field validation metadata.

```text
field path → validation rules
source path → cross-field validators
```

This can improve targeted validation.

---

# 30. Schema Type Inference — P0

Strengthen compile-time value inference.

Example:

```ts
const schema = {
  schemaVersion: 1,
  id: 'profile',
  fields: [
    {
      name: 'name',
      type: 'text'
    },
    {
      name: 'age',
      type: 'number'
    },
    {
      name: 'active',
      type: 'checkbox'
    }
  ]
} as const;
```

Goal:

```ts
type Values = InferFormValues<typeof schema>;
```

becomes:

```ts
{
  name: string;
  age: number | null;
  active: boolean;
}
```

---

# 31. Nested Type Inference — P0

Object:

```ts
{
  name: 'address',
  type: 'object',
  fields: [
    { name: 'city', type: 'text' },
    { name: 'zip', type: 'text' }
  ]
}
```

Infer:

```ts
{
  address: {
    city: string;
    zip: string;
  };
}
```

Array:

```ts
{
  name: 'items',
  type: 'array',
  item: {
    type: 'object',
    fields: [
      { name: 'product', type: 'text' },
      { name: 'quantity', type: 'number' }
    ]
  }
}
```

Infer:

```ts
{
  items: Array<{
    product: string;
    quantity: number | null;
  }>;
}
```

---

# 32. Type-Level Tests — P0

Add tests using `expectTypeOf`, `tsd`, or equivalent.

Test:

- [ ] text value
- [ ] number value
- [ ] boolean value
- [ ] select value
- [ ] multi-select value
- [ ] object
- [ ] array
- [ ] nested object
- [ ] array of objects
- [ ] object containing arrays
- [ ] arrays containing nested objects
- [ ] path inference
- [ ] path-value inference
- [ ] invalid field configuration
- [ ] invalid validation rules
- [ ] invalid structural field

---

# 33. Migration Architecture — P1

Create a migration contract before you actually need it.

```ts
export interface SchemaMigration<
  TFrom extends number,
  TTo extends number
> {
  from: TFrom;
  to: TTo;
  migrate(schema: unknown): unknown;
}
```

Future:

```text
Schema v1
   ↓
migrate 1 → 2
   ↓
Schema v2
```

Potential API:

```ts
migrateSchema(schema, targetVersion);
```

For 1.0, the architecture and policy matter more than having many migrations.

---

# 34. Deprecation Architecture — P1

If a schema property is replaced:

```text
visibleWhen
```

with:

```text
conditions.visible
```

do not silently break persisted schemas.

Possible process:

```text
Version N
  old property supported + warning

Version N+1
  migration available

Future major
  old property removed
```

Diagnostic example:

```text
SCHEMA_DEPRECATED_PROPERTY
```

---

# 35. Schema Compiler API — P0

Recommended public shape:

```ts
export interface CompileSchemaOptions {
  warningsAsErrors?: boolean;
}

export interface SchemaCompileSuccess {
  success: true;
  schema: CompiledFormSchema;
  diagnostics: readonly SchemaDiagnostic[];
}

export interface SchemaCompileFailure {
  success: false;
  diagnostics: readonly SchemaDiagnostic[];
}

export type SchemaCompileResult =
  | SchemaCompileSuccess
  | SchemaCompileFailure;

export function compileSchema(
  schema: FormSchema,
  options?: CompileSchemaOptions
): SchemaCompileResult;
```

This avoids throwing for ordinary authoring mistakes if that fits your existing API style.

Alternatively provide both:

```ts
compileSchema()
compileSchemaOrThrow()
```

Freeze one convention before 1.0.

---

# 36. FormRuntime Integration — P0

Eventually:

```ts
const result = compileSchema(schema);

if (!result.success) {
  // report diagnostics
}

const runtime = new FormRuntime({
  schema: result.schema
});
```

Or provide convenience:

```ts
createFormRuntime({
  schema
});
```

that internally compiles.

## Important

`FormRuntime` should execute compiled schema, not repeatedly parse the public authoring model.

---

# 37. Compilation Caching — P2

If the same immutable schema creates many form instances, allow compiled schema reuse.

```ts
const compiled = compileSchema(schema);

const formA = new FormRuntime(compiled);
const formB = new FormRuntime(compiled);
const formC = new FormRuntime(compiled);
```

This is valuable for:

- table editors
- repeated forms
- dialogs
- server workloads
- tests

Do not introduce unsafe identity-based caching until immutability rules are clear.

---

# 38. Builder Compatibility — P1

Schema architecture should support a visual builder without making Core a builder.

Builder operations:

```text
add field
remove field
rename field
move field
duplicate field
nest field
change type
add condition
add dependency
configure datasource
configure validation
```

Core should expose enough validation/diagnostics for builder feedback.

Example:

```text
Cannot delete "country".

It is referenced by:
- state datasource
- city visibility condition
```

That becomes possible with compiled indexes.

---

# 39. Diagnostics / Explainability Integration — P1

Compiled schema should make runtime explainability possible.

Future API:

```ts
runtime.explainField('state');
```

Potential result:

```ts
{
  path: 'state',

  visible: {
    value: true,
    reason: 'country equals IN'
  },

  required: {
    value: true,
    reason: 'country equals IN'
  },

  dependencies: [
    {
      source: 'country',
      effect: 'reloadDataSource'
    }
  ]
}
```

Schema compiler indexes are the foundation for this.

---

# 40. Security / Safety of Diagnostics — P1

Diagnostics should not automatically expose sensitive form values.

Prefer:

```text
Condition "country == expected value" evaluated true
```

or opt-in value reporting.

Be particularly careful with:

- passwords
- tokens
- identity numbers
- payment information
- custom secret fields

---

# 41. Schema Performance Benchmarks — P1

Benchmark:

```text
validateSchema()
normalizeSchema()
compileSchema()
```

for:

```text
100 fields
500 fields
1,000 fields
5,000 fields
```

Include:

- flat fields
- nested objects
- arrays
- many conditions
- long dependency chains
- many datasource references

Measure:

```text
validation time
normalization time
compilation time
memory
compiled schema size
```

Do not set arbitrary performance guarantees before collecting baseline data.

---

# 42. Runtime Performance After Compilation — P1

Measure whether compiled indexes improve:

```text
setValue
condition propagation
dependency propagation
datasource invalidation
targeted validation
field lookup
```

The desired complexity should generally move away from:

```text
change one field
→ scan every schema field
```

toward:

```text
change one field
→ lookup affected nodes
→ process affected nodes
```

---

# 43. Schema Test Matrix — P0

Create comprehensive tests.

## Basic

- [ ] empty schema
- [ ] one field
- [ ] many fields
- [ ] duplicate field
- [ ] invalid name
- [ ] unsupported type

## Objects

- [ ] object with fields
- [ ] empty object
- [ ] nested object
- [ ] duplicate nested field
- [ ] deep object

## Arrays

- [ ] primitive array
- [ ] object array
- [ ] nested arrays if supported
- [ ] array defaults
- [ ] array validation
- [ ] array paths

## Conditions

- [ ] valid reference
- [ ] missing reference
- [ ] AND
- [ ] OR
- [ ] NOT
- [ ] nested condition
- [ ] null
- [ ] undefined
- [ ] false
- [ ] zero
- [ ] empty string
- [ ] empty array

## Dependencies

- [ ] valid dependency
- [ ] missing dependency
- [ ] self-cycle
- [ ] 2-node cycle
- [ ] multi-node cycle
- [ ] long valid chain

## DataSources

- [ ] static
- [ ] API
- [ ] function if supported
- [ ] search
- [ ] pagination
- [ ] dependent parameter
- [ ] missing reference
- [ ] invalid configuration

## Validation

- [ ] required
- [ ] min/max
- [ ] minLength/maxLength
- [ ] invalid regex
- [ ] multipleOf
- [ ] minItems/maxItems
- [ ] nested validation

## Versioning

- [ ] current version
- [ ] missing version
- [ ] unsupported old version
- [ ] unsupported future version
- [ ] migration

## Immutability

- [ ] validation doesn't mutate
- [ ] normalization doesn't mutate
- [ ] compilation doesn't mutate
- [ ] runtime doesn't mutate public schema

---

# 44. Property/Fuzz Testing — P2

Schema validation is a good candidate for property-based testing.

Generate:

- random field trees
- random paths
- random dependencies
- random conditions
- malformed schemas

Verify:

```text
compiler never crashes unexpectedly
input is never mutated
diagnostics remain deterministic
valid schemas compile consistently
```

---

# 45. Snapshot Tests — P1

Use normalized schema snapshots carefully.

Example:

```ts
expect(normalizeSchema(schema)).toMatchInlineSnapshot();
```

This helps catch accidental normalized-contract changes.

Do not overuse snapshots where explicit assertions are clearer.

---

# 46. Public API Stability — P0

Do not wildcard-export every internal schema compiler implementation.

Prefer deliberate exports:

```ts
export {
  validateSchema,
  compileSchema
} from './schema';

export type {
  FormSchema,
  FormField,
  SchemaDiagnostic,
  SchemaCompileResult
} from './schema';
```

Keep internal:

```text
graph node implementation
condition bytecode/internal representation
normalization helpers
compiler visitors
private indexes
```

This reduces future semver burden.

---

# 47. Stable vs Experimental API — P0

Classify schema APIs.

## Stable

Candidate:

```text
FormSchema
FormField
FieldType
FieldOption
ValidationRules
Condition
DataSourceConfig
validateSchema()
compileSchema()
SchemaDiagnostic
```

## Experimental

Potential:

```text
migration registry
compiler plugins
custom compiler passes
advanced extension validators
```

## Internal

```text
NormalizedFieldNode
DependencyGraphNode
ConditionIndexEntry
CompilerContext
```

Do not accidentally export internals.

---

# 48. Error Handling Contract — P0

Choose consistent behavior.

Recommended:

Authoring/configuration errors:

```ts
{
  success: false,
  diagnostics: [...]
}
```

Programming/runtime invariant errors:

```text
throw
```

Do not mix exceptions and result objects unpredictably.

---

# 49. Documentation Required Before 1.0 — P1

Create:

```text
docs/core/schema/
├── overview.md
├── field-types.md
├── nested-fields.md
├── arrays.md
├── defaults.md
├── validation.md
├── conditions.md
├── dependencies.md
├── datasources.md
├── paths.md
├── versioning.md
├── diagnostics.md
├── extensions.md
├── serialization.md
├── migrations.md
└── compatibility.md
```

---

# 50. Example Schemas Required — P1

Maintain production examples.

## Example 1

Basic registration.

## Example 2

Nested customer/address.

## Example 3

Country → state → city cascading datasource.

## Example 4

Conditional approval form.

## Example 5

Array/order-line form.

## Example 6

Complex validation.

## Example 7

Large enterprise form.

## Example 8

Portable JSON schema loaded from server.

Every example should compile through the same production compiler.

---

# 51. JSON Schema Adapter Boundary — P1

`@dynamic-form-engine/json-schema` should translate:

```text
JSON Schema
     ↓
Dynamic Forms public FormSchema
     ↓
Core normalize/compile pipeline
```

Core should not become dependent on JSON Schema.

Keep:

```text
@dynamic-form-engine/core
         ↑
@dynamic-form-engine/json-schema
```

not:

```text
core → json-schema
```

---

# 52. Framework Adapter Boundary — P0

React:

```text
Compiled Core Schema
      ↓
FormRuntime
      ↓
React adapter
      ↓
React renderer
```

Angular:

```text
Compiled Core Schema
      ↓
FormRuntime
      ↓
Angular adapter
      ↓
Angular renderer
```

Vue:

```text
Compiled Core Schema
      ↓
FormRuntime
      ↓
Vue adapter
      ↓
Vue renderer
```

The schema compiler must have zero dependency on these frameworks.

---

# 53. Recommended Folder Architecture

```text
packages/core/src/schema/
│
├── index.ts
│
├── types/
│   ├── schema.ts
│   ├── fields.ts
│   ├── options.ts
│   ├── validation.ts
│   ├── conditions.ts
│   ├── dependencies.ts
│   ├── datasource.ts
│   ├── diagnostics.ts
│   ├── normalized.ts
│   └── compiled.ts
│
├── paths/
│   ├── normalizePath.ts
│   ├── parsePath.ts
│   ├── joinPath.ts
│   └── index.ts
│
├── validation/
│   ├── validateSchema.ts
│   ├── validateFields.ts
│   ├── validateReferences.ts
│   ├── validateConditions.ts
│   ├── validateDependencies.ts
│   ├── validateDataSources.ts
│   └── index.ts
│
├── normalization/
│   ├── normalizeSchema.ts
│   ├── normalizeField.ts
│   ├── normalizeCondition.ts
│   ├── normalizeDependency.ts
│   ├── normalizeDataSource.ts
│   └── index.ts
│
├── compiler/
│   ├── compileSchema.ts
│   ├── compileFields.ts
│   ├── compileConditions.ts
│   ├── compileDependencies.ts
│   ├── compileDataSources.ts
│   ├── compileValidation.ts
│   ├── buildFieldIndex.ts
│   └── index.ts
│
├── graph/
│   ├── dependencyGraph.ts
│   ├── cycleDetection.ts
│   └── index.ts
│
├── migration/
│   ├── types.ts
│   ├── migrateSchema.ts
│   └── index.ts
│
└── __tests__/
    ├── schema.test.ts
    ├── normalization.test.ts
    ├── compiler.test.ts
    ├── diagnostics.test.ts
    ├── paths.test.ts
    ├── dependencies.test.ts
    ├── conditions.test.ts
    ├── datasource.test.ts
    ├── migration.test.ts
    ├── immutability.test.ts
    └── types.test-d.ts
```

Do not restructure merely for appearance. Introduce folders as responsibilities become real.

---

# 54. Recommended Implementation Phases

## Phase 1 — Contract Freeze — P0

Goal: establish the stable schema boundary.

Tasks:

- [ ] Add `schemaVersion`
- [ ] Export `CURRENT_SCHEMA_VERSION`
- [ ] Define supported version behavior
- [ ] Define `SchemaDiagnostic`
- [ ] Define diagnostic codes
- [ ] Define errors vs warnings
- [ ] Freeze canonical field path rules
- [ ] Freeze object semantics
- [ ] Freeze array semantics
- [ ] Freeze default value precedence
- [ ] Freeze condition semantics
- [ ] Freeze dependency semantics
- [ ] Freeze datasource schema boundary
- [ ] Identify stable/experimental/internal exports

Exit criteria:

```text
Public schema contract is clear enough that changing it
would intentionally require semver consideration.
```

---

## Phase 2 — Normalization Layer — P0

Tasks:

- [ ] Create `NormalizedFormSchema`
- [ ] Create `NormalizedField`
- [ ] Implement `normalizeSchema()`
- [ ] Normalize paths
- [ ] Normalize defaults
- [ ] Normalize validation
- [ ] Normalize conditions
- [ ] Normalize dependencies
- [ ] Normalize datasource configuration
- [ ] Normalize options
- [ ] Normalize structural fields
- [ ] Guarantee no input mutation
- [ ] Add idempotence tests

Exit criteria:

```text
Runtime-facing code no longer needs to understand
multiple equivalent public schema shapes.
```

---

## Phase 3 — Schema Compiler — P0

Tasks:

- [ ] Implement `compileSchema()`
- [ ] Build `fieldsByPath`
- [ ] Compile conditions
- [ ] Compile dependency graph
- [ ] Compile datasource references
- [ ] Compile validation metadata
- [ ] Resolve all cross-field references
- [ ] Detect dependency cycles
- [ ] Produce compile diagnostics
- [ ] Return `CompiledFormSchema`
- [ ] Freeze/protect compiled representation

Exit criteria:

```text
A schema is either rejected with deterministic diagnostics
or transformed into a valid runtime-ready representation.
```

---

## Phase 4 — Runtime Integration — P0

Tasks:

- [ ] Make FormRuntime consume normalized/compiled schema
- [ ] Remove repeated raw schema scans
- [ ] Use field index
- [ ] Use dependency graph
- [ ] Use condition indexes
- [ ] Use datasource indexes
- [ ] Preserve existing public behavior
- [ ] Add lifecycle integration tests

Exit criteria:

```text
FormRuntime does not depend on interpreting raw authoring
schema during ordinary field updates.
```

---

## Phase 5 — Nested Data Hardening — P0

Tasks:

- [ ] Nested objects
- [ ] Deep objects
- [ ] arrays
- [ ] arrays of objects
- [ ] object containing arrays
- [ ] nested array policy
- [ ] nested default values
- [ ] nested validation
- [ ] nested conditions
- [ ] nested dependencies
- [ ] nested datasource parameters
- [ ] reset nested values
- [ ] remove array items
- [ ] add array items
- [ ] path stability

Exit criteria:

```text
Object/array behavior is deterministic and documented.
```

---

## Phase 6 — Type-System Hardening — P0

Tasks:

- [ ] Discriminated field unions
- [ ] Type-specific defaults
- [ ] Type-specific validation
- [ ] `InferFormValues`
- [ ] nested object inference
- [ ] array inference
- [ ] typed paths
- [ ] typed path values
- [ ] compile-time invalid-schema tests

Exit criteria:

```text
Common schema mistakes are caught by TypeScript
before runtime whenever practical.
```

---

## Phase 7 — Diagnostics / Builder Support — P1

Tasks:

- [ ] Stable diagnostic codes
- [ ] related paths
- [ ] warnings
- [ ] deprecated-property warnings
- [ ] reference lookup information
- [ ] dependency explanations
- [ ] condition explanations
- [ ] builder-friendly diagnostics
- [ ] prepare runtime `explainField()`

Exit criteria:

```text
A developer can understand why a schema failed without
debugging Core internals.
```

---

## Phase 8 — Performance — P1

Tasks:

- [ ] Benchmark 100 fields
- [ ] Benchmark 500 fields
- [ ] Benchmark 1,000 fields
- [ ] Benchmark 5,000 fields
- [ ] Benchmark nested forms
- [ ] Benchmark condition-heavy forms
- [ ] Benchmark dependency-heavy forms
- [ ] Benchmark compile time
- [ ] Benchmark runtime lookup
- [ ] Benchmark memory
- [ ] Compare raw scanning vs compiled indexes

Exit criteria:

```text
Performance claims are backed by repeatable benchmarks.
```

---

## Phase 9 — Versioning / Migration — P1

Tasks:

- [ ] Migration interface
- [ ] migration runner
- [ ] unsupported-version behavior
- [ ] deprecated property policy
- [ ] compatibility documentation
- [ ] migration tests

Exit criteria:

```text
Core has a defined answer for how persisted v1 schemas
will survive future schema versions.
```

---

## Phase 10 — 1.0 Release Gate — P0/P1

- [ ] All P0 schema tasks complete
- [ ] No unresolved schema correctness bugs
- [ ] Public schema API reviewed
- [ ] Explicit exports
- [ ] No accidental compiler internals exported
- [ ] Type-level tests pass
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] nested data tests pass
- [ ] cycle tests pass
- [ ] datasource reference tests pass
- [ ] immutability tests pass
- [ ] performance baseline recorded
- [ ] schema documentation complete
- [ ] examples complete
- [ ] migration policy documented
- [ ] semver policy documented
- [ ] `npm pack --dry-run` verified
- [ ] packed tarball tested outside monorepo
- [ ] React integration tested
- [ ] Angular integration tested
- [ ] Native HTML integration tested
- [ ] RC published and field-tested before stable 1.0

---

# 55. Definition of Done for Schema Architecture

Schema architecture can be considered stable for `1.0.0` when:

1. A public schema has an explicit version.
2. Public schema and runtime schema are separate concepts.
3. Schema validation produces structured diagnostics.
4. Normalization creates one canonical representation.
5. Compilation resolves references before runtime.
6. Full dependency cycles are detected before runtime.
7. Conditions use a normalized internal model.
8. DataSource dependencies are compiled.
9. Field paths are canonical across Core.
10. Object and array semantics are frozen.
11. Default-value behavior is documented and tested.
12. Schema input is never mutated.
13. Runtime uses indexes instead of repeated full-tree scans where appropriate.
14. Type inference works for nested objects and arrays.
15. Core remains independent of React/Angular/Vue/renderers.
16. Portable schema remains JSON-friendly.
17. Extensions have a defined boundary.
18. Public exports are intentional.
19. Migration/version policy exists.
20. Tests cover invalid, nested, asynchronous-reference and edge-case schemas.
21. Benchmarks establish a performance baseline.
22. Production examples use the same compiler used by real applications.

---

# 56. Suggested Target Score

Current approximate schema architecture:

```text
7.8 / 10
```

After Phase 1–3:

```text
~9.0 / 10
```

After Phase 4–6:

```text
~9.5 / 10
```

After diagnostics, performance, migration policy, documentation and release validation:

```text
~9.8–10 / 10
```

The goal is not to maximize the number of schema features.

The goal is:

```text
small public contract
        +
strong type safety
        +
deterministic normalization
        +
validated references
        +
compiled runtime representation
        +
clear compatibility policy
        =
stable schema architecture
```

---

# 57. Recommended Final Architecture

```text
                    USER / BUILDER
                         │
                         ▼
                  ┌─────────────┐
                  │ FormSchema  │
                  │ Version 1   │
                  └──────┬──────┘
                         │
                         ▼
               ┌──────────────────┐
               │ Version Checker  │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │ Schema Validator │
               └────────┬─────────┘
                        │
                        ▼
              SchemaDiagnostics
                        │
                  no errors
                        │
                        ▼
              ┌───────────────────┐
              │ Schema Normalizer │
              └─────────┬─────────┘
                        │
                        ▼
              NormalizedFormSchema
                        │
                        ▼
               ┌─────────────────┐
               │ Schema Compiler │
               └────────┬────────┘
                        │
          ┌─────────────┼──────────────┐
          │             │              │
          ▼             ▼              ▼
     Field Index   Dependency Graph Condition Index
          │             │              │
          ├─────────────┼──────────────┤
          │             │              │
          ▼             ▼              ▼
  DataSource Index Validation Index Default Metadata
          │             │              │
          └─────────────┼──────────────┘
                        │
                        ▼
                CompiledFormSchema
                        │
                        ▼
                   FormRuntime
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
   FormStore       Condition Engine   Dependencies
       │                │                │
       ├────────────────┼────────────────┤
       ▼                ▼                ▼
  Validation       DataSources        Plugins
       │                │                │
       └────────────────┼────────────────┘
                        ▼
                 Events / Diagnostics
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
          React       Angular       Vue
            │           │           │
            └───────────┼───────────┘
                        ▼
                Native/UI Renderers
```

---

# 58. Immediate Next Implementation Order

Do not start with migration tooling or compiler caching.

Implement in this order:

```text
1. schemaVersion
2. SchemaDiagnostic + diagnostic codes
3. canonical field paths
4. freeze object/array semantics
5. discriminated field schema
6. NormalizedFormSchema
7. normalizeSchema()
8. normalized conditions
9. normalized dependencies
10. normalized datasource config
11. CompiledFormSchema
12. fieldsByPath
13. full reference validation
14. dependency graph + cycle detection
15. condition reverse index
16. datasource dependency index
17. FormRuntime compiled-schema integration
18. nested object/array hardening
19. type-level inference tests
20. immutability tests
21. performance benchmarks
22. diagnostics/explainability
23. migration/version policy
24. documentation
25. RC integration testing
26. stable 1.0
```

---

# 59. Things NOT to Add During Stabilization

Avoid scope expansion until the schema contract is stable.

Do not prioritize:

- more UI controls
- MUI-specific schema
- React-specific schema properties
- Angular-specific schema properties
- Vue-specific schema properties
- CSS framework configuration in Core
- large expression languages
- arbitrary script execution
- unnecessary condition operators
- many new datasource types
- advanced compiler plugins
- premature compiler caching
- builder-only state inside runtime schema

Stabilize the foundation first.

---

# 60. Final 1.0 Schema Checklist

## Contract

- [ ] `schemaVersion`
- [ ] stable field union
- [ ] stable option model
- [ ] stable validation model
- [ ] stable condition model
- [ ] stable dependency model
- [ ] stable datasource model
- [ ] stable path semantics
- [ ] stable object semantics
- [ ] stable array semantics

## Compiler

- [ ] validation
- [ ] normalization
- [ ] field indexing
- [ ] reference resolution
- [ ] dependency graph
- [ ] cycle detection
- [ ] condition indexing
- [ ] datasource indexing
- [ ] validation indexing
- [ ] deterministic diagnostics

## Correctness

- [ ] no schema mutation
- [ ] duplicate detection
- [ ] missing reference detection
- [ ] invalid validation detection
- [ ] invalid datasource detection
- [ ] nested object support
- [ ] array support
- [ ] reset/default semantics
- [ ] edge-condition semantics

## Type Safety

- [ ] discriminated fields
- [ ] typed defaults
- [ ] typed validation
- [ ] inferred values
- [ ] nested inference
- [ ] array inference
- [ ] typed paths
- [ ] typed path values

## Compatibility

- [ ] JSON-safe portable contract
- [ ] migration policy
- [ ] deprecation policy
- [ ] semver policy
- [ ] extension policy
- [ ] renderer independence

## Production Proof

- [ ] benchmark suite
- [ ] memory checks
- [ ] unit tests
- [ ] integration tests
- [ ] type tests
- [ ] documentation
- [ ] examples
- [ ] npm tarball test
- [ ] React consumer test
- [ ] Angular consumer test
- [ ] native HTML consumer test
- [ ] release candidate validation

---

## Final Principle

> **The public schema should describe the form. The normalized schema should remove ambiguity. The compiled schema should make execution fast and deterministic. The runtime should execute the compiled contract rather than reinterpret user configuration.**

That separation is the key schema-architecture change required to take `@dynamic-form-engine/core` from a strong pre-1.0 design to a stable enterprise-grade `1.0.0` foundation.
