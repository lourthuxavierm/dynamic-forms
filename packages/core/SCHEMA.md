# Schema normalization and versioning

Core accepts a concise public `FormSchema`, validates it, and converts it into a deeply frozen `NormalizedFormSchema` before the composed runtime starts. This keeps authoring flexible while conditions, dependencies, data sources, plugins, and state initialization consume one canonical representation.

## Version fields

- `schemaVersion` is the numeric Core schema-format version. The current value is `CURRENT_SCHEMA_VERSION` (1).
- `version` remains an optional consumer-defined release label, such as `v2.3.0`. Core does not interpret it.
- Omitting `schemaVersion` means the current version, preserving existing schemas.
- A schema newer than the installed Core version is rejected with an `unsupported-schema-version` diagnostic.

## Normalization

`normalizeSchema(schema)` returns `{ valid, schema, diagnostics }`. Successful output is independent of the input object and deeply frozen. Core supplies predictable labels, field defaults, validation objects, condition copies, dependency arrays, options, structural children, hidden-value behavior, and data-source defaults.

Use `normalizeSchemaOrThrow(schema)` when invalid schemas should stop construction. `FormRuntime` uses this behavior automatically and exposes its canonical schema as `runtime.schema`. It also merges normalized field defaults beneath explicitly supplied initial values.

Diagnostics have stable categories for malformed schemas, duplicate names/options, invalid references, dependency cycles, invalid validation and data sources, unsupported versions, and missing migrations. They include the schema path and a human-readable message.

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
