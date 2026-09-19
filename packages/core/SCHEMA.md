# Schema normalization and versioning

Core accepts a concise public `FormSchema`, validates it, and converts it into a deeply frozen `NormalizedFormSchema` before the composed runtime starts. This keeps authoring flexible while conditions, dependencies, data sources, plugins, and state initialization consume one canonical representation.

Core then compiles that canonical schema with `compileSchema()` into immutable field, dependency, condition, datasource, validation, and default-value indexes. `FormRuntime.compiledSchema` is the runtime contract; `FormRuntime.schema` remains the normalized authoring-compatible view. `runtime.explainField(path)` exposes builder-friendly relationships without requiring callers to inspect compiler internals.

For persisted schema authoring, use `defineFormSchema()` or `StrictFormSchema`. They require `schemaVersion: 1`; their `FormField` discriminated union enforces type-specific defaults, validation, and configuration through `FieldConfigMap`, and separates value fields from required-child object/array fields. The broader `FieldSchema` remains the compatibility boundary for programmatically registered custom controls whose type names Core cannot know in advance.

Fields may provide a stable `id` for builder selection, rename tracking, schema diffs, and migrations. `name` remains the data-binding identity. IDs are optional opaque strings: when present they must be non-empty, contain no leading or trailing whitespace, and be unique across the entire form, including nested fields. Core deliberately does not require UUIDs or derive IDs from data paths. Extensions belong under `extensions` and must use a collision-resistant namespace such as `@dynamic-form-engine/react-html` or an application-owned name. Core never interprets renderer namespaces.

`definePortableFormSchema()`, `PortableFormSchema`, `PortableFormField`, `JsonValue`, and `PortableDataSourceConfig` enforce the recursive JSON-safe persistence boundary. Function data sources and function-valued metadata/extensions are programmatic runtime configuration and are not portable. Deprecations retain their old behavior for the current major version and produce warnings before removal; incompatible schema or exported-type changes require a major release.

Options use primitive string, number, or boolean identity. Equality follows `Object.is`, so `1` and `"1"` are distinct. Duplicate values are rejected among siblings at every tree level. Disabled state and nested children survive normalization. `PortableFieldOption` restricts option metadata recursively to JSON values.

## Frozen structural and path contract

- Object and array fields use `fields` for child schemas in version 1. Arrays interpret those children as the shape of each item. The `item` spelling is not accepted in schema version 1.
- Canonical runtime paths use dot syntax, including numeric array indexes: `orders.0.product`. Public bracket paths such as `orders[0].product` normalize to that form.
- Persisted schema references are template-level paths. Concrete or template array-item references such as `orders[0].product`, `orders.0.product`, and `orders.product` are rejected because Core does not yet compile conditions, dependencies, or data sources per runtime item. A field may reference the array container `orders` as a whole. Runtime value APIs continue to support concrete indexed paths.
- `normalizePath`, `parsePath`, `joinPath`, `parentPath`, `isSamePath`, `isAncestorPath`, and `isDescendantPath` are the shared path primitives.
- Explicit runtime initial values override schema defaults. Schema defaults override field-type defaults. Object values merge recursively, so a partial runtime object retains unspecified nested schema defaults. Arrays are replaced as complete values and are never index-merged.
- Persisted object and array defaults are validated recursively. Partial object defaults may omit declared children, but unknown keys are rejected. Object-array items must match the declared child shape; primitive arrays marked with `metadata.primitiveItems` validate every item against their single child field.
- `createArrayItemValue(schema, path)` creates a fresh item from an array field's normalized child defaults. Primitive arrays marked with `metadata.primitiveItems` receive the single child default directly.
- `reset()` restores the runtime's current initial values. `reset(newInitialValues)` establishes a new initial baseline after recursively merging schema defaults beneath the supplied values.
- Hidden values are preserved unless `hiddenValuePolicy` explicitly selects `clear` or `reset`.

## Version fields

- `schemaVersion` is the numeric Core schema-format version. The current value is `CURRENT_SCHEMA_VERSION` (1).
- `version` remains an optional consumer-defined release label, such as `v2.3.0`. Core does not interpret it.
- Omitting `schemaVersion` means the current version, preserving existing schemas.
- A schema newer than the installed Core version is rejected with an `unsupported-schema-version` diagnostic.

## Normalization

`normalizeSchema(schema)` returns `{ valid, schema, diagnostics }`. Successful output is independent of the input object and deeply frozen. Core supplies predictable labels, field defaults, validation objects, condition copies, dependency arrays, options, structural children, hidden-value behavior, and data-source defaults.

Use `normalizeSchemaOrThrow(schema)` when invalid schemas should stop construction. `FormRuntime` uses this behavior automatically and exposes its canonical schema as `runtime.schema`. It also merges normalized field defaults beneath explicitly supplied initial values.

Diagnostics have stable categories for malformed schemas, built-in default-value type mismatches, duplicate names/options, invalid references, dependency cycles, invalid validation and data sources, unsupported versions, and missing migrations. They include the schema path and a human-readable message. Option identity is type-sensitive (1 and "1" are distinct), and duplicate values are checked independently at every level of a nested option tree.

Diagnostic identity comes from stable uppercase `code` values such as `FIELD_DUPLICATE`, `DEFAULT_VALUE_TYPE_MISMATCH`, `CONDITION_REFERENCE_NOT_FOUND`, `DEPENDENCY_REFERENCE_NOT_FOUND`, `DATASOURCE_PARAMETER_REFERENCE_NOT_FOUND`, and `DEPENDENCY_CYCLE`. Consumers must branch on `code`, never `message`. Reference failures provide `relatedPath`; diagnostics may provide machine-readable `details` such as the expected field type, invalid ranges, or the complete cycle.

## Migrations

Migrations are explicit, ordered, framework-independent transformations:

```ts
const migrations: SchemaMigration[] = [{
  from: 0,
  to: 1,
  migrate(schema) {
    return { ...schema, schemaVersion: 1 };
  },
}];

const normalized = normalizeSchema(oldSchema, { migrations });
const runtime = new FormRuntime(oldSchema, initialValues, {
  schema: { migrations },
});
```

Each migration receives a deeply frozen clone, must return the declared target version, and is followed until `CURRENT_SCHEMA_VERSION`. Missing paths, loops, thrown errors, and incorrect target versions produce diagnostics. Migrations should be pure and deterministic; retain old migration steps for every persisted schema version your application supports.

## Deprecation policy

Deprecated properties continue to behave as documented throughout the current major line and emit `DEPRECATED_PROPERTY` with replacement and removal metadata. The legacy field-level `required` shortcut normalizes to `validation.required` and is scheduled for removal in 2.0. New schemas should only use `validation.required`.

## Stable and internal boundaries

Public authoring types, normalization and compilation entry points, diagnostics, migrations, path helpers, `CompiledFormSchema`'s readonly indexes, and `explainField()` are supported public contracts. Helper functions not exported from package entry points remain internal. New indexes may be added compatibly, but removing or changing an existing exported field requires semver review.

## JSON Schema adapter boundary

JSON Schema import/export belongs in an adapter package, not the Core runtime. An adapter can preserve primitive/object/array shape, requiredness, ranges, string constraints, enums, labels, and defaults. Conditions, dependency effects, datasource loaders, renderer extensions, custom controls, and runtime functions have no lossless standard JSON Schema representation and must be carried in namespaced extension keywords or reported as conversion diagnostics.

See `EXAMPLES.md` for portable, nested, conditional, datasource, validation, and custom-control examples.
