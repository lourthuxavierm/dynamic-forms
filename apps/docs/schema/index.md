# Schema guide

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@dynamic-forms/core` 0.1.0

The schema is the framework-independent contract describing fields, validation,
conditional behavior, dependencies, data sources, nested values, and metadata.
It does not contain React, Angular, DOM, or layout-renderer components.

## Reference

- [Overview](./overview.md)
- [FormSchema](./form-schema.md)
- [FieldSchema](./field-schema.md)
- [Default values](./default-values.md)
- [Validation](./validation.md)
- [Conditions](./conditions.md)
- [Dependencies](./dependencies.md)
- [Data sources](./data-sources.md)
- [Metadata](./metadata.md)
- [Nested objects](./nested-objects.md)
- [Arrays](./arrays.md)
- [Layouts](./layouts.md)
- [Versioning](./versioning.md)

## Boundary

Core accepts custom field type strings and open-ended configuration. A schema
can therefore be valid in Core but unsupported by a particular renderer. Check
the renderer registry and compatibility documentation before deployment.
