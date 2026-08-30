# Schema overview

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-core` 0.1.0
- Prerequisites: Basic TypeScript

## Contract layers

```text
FormSchema
  -> fields: FieldSchema[]
       -> value, validation, conditions, dependencies, data source
       -> optional child fields for object and array
  -> consumed by Core runtime
  -> rendered by a compatible integration
```

Core owns schema meaning. Renderers own visual controls, layout components, and
browser interaction. The same schema may be reused only where each selected
field type and configuration is supported by the target renderer.

## Minimal schema

```ts verify
import { validateSchema, type FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const profileSchema: FormSchema = {
  id: 'profile',
  version: '1.0.0',
  fields: [
    { name: 'name', type: 'text', label: 'Name', validation: { required: true } },
  ],
};

const result = validateSchema(profileSchema);
if (!result.valid) throw new Error(JSON.stringify(result.errors));
```

## Validation boundaries

`validateSchema` checks structural consistency, rule ranges, regular expression
syntax, duplicate sibling names and option values, references, and data-source
requirements. It does not prove that a renderer registers every custom type,
that remote URLs are trusted, or that metadata follows an application contract.

## Serialization

Most schema properties can be JSON. Function data-source loaders and arbitrary
metadata may contain runtime-only values. Treat remote schemas as untrusted
input, validate them, and resolve executable behavior from an application-owned
registry rather than accepting executable code from the network.
