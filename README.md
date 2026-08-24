# Dynamic Forms

A TypeScript-first dynamic forms monorepo with a framework-independent state engine, React bindings, and an accessible native HTML renderer.

Status: pre-1.0 development (`0.1.0`). Core, React, HTML, and Examples are implemented. The Zod, React Hook Form, JSON Schema, and DevTools packages are placeholders.

## Packages

| Package | Purpose | Current maturity |
| --- | --- | --- |
| `@dynamic-forms/core` | Schema, store, conditions, dependencies, data sources, events, and validation | Implemented |
| `@dynamic-forms/react` | React provider, hooks, subscriptions, and renderer-neutral components | Implemented |
| `@dynamic-forms/html` | Accessible browser-native controls, layouts, registry, and styles | Implemented |
| `@dynamic-forms/examples` | Adapter-neutral example schemas, values, and rules | Implemented |
| `@dynamic-forms/zod` | Planned Zod adapter | Placeholder |
| `@dynamic-forms/rhf` | Planned React Hook Form adapter | Placeholder |
| `@dynamic-forms/json-schema` | Planned JSON Schema adapter | Placeholder |
| `@dynamic-forms/devtools` | Planned developer tooling | Placeholder |

## Architecture

```text
FormSchema
    |
    v
@dynamic-forms/core
  FormStore, validation, conditions, dependencies, data sources, events
    |
    v
@dynamic-forms/react
  FormProvider, hooks, subscriptions
    |
    v
@dynamic-forms/html
  HtmlForm, native controls, layouts, registry, optional static CSS
```

Core contains no framework or renderer logic. React owns lifecycle and subscription integration. HTML owns browser-native rendering, accessibility, layouts, and styling.

## Quick start

Install the implemented runtime packages and React peers:

```bash
pnpm add @dynamic-forms/core @dynamic-forms/react @dynamic-forms/html
pnpm add react react-dom
```

Import the optional default stylesheet once:

```ts
import '@dynamic-forms/html/styles.css';
```

Create a schema and render it with `FormProvider` and `HtmlForm`:

```tsx
import type { FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { HtmlForm } from '@dynamic-forms/html';

const schema: FormSchema = {
  id: 'customer',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      validation: { required: true, minLength: 2 },
    },
    {
      name: 'customerType',
      type: 'select',
      label: 'Customer type',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Business', value: 'business' },
      ],
    },
    {
      name: 'companyName',
      type: 'text',
      label: 'Company name',
      visibleWhen: { field: 'customerType', operator: 'equals', value: 'business' },
    },
  ],
};

export function CustomerForm() {
  return (
    <FormProvider
      schema={schema}
      defaultValues={{ customerType: 'individual' }}
      onSubmit={async (values) => console.log(values)}
    >
      <HtmlForm schema={schema} />
    </FormProvider>
  );
}
```

See the [HTML package README](./packages/html/README.md) for registry overrides, layouts, styling, accessibility, performance, and specialized controls.

## Workspace development

Requirements:

- Node.js compatible with the installed toolchain
- pnpm 10.15.0

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm --filter @dynamic-forms/html-playground dev
```

## Documentation

- [Documentation site](./apps/docs/index.md)
- [Documentation standards](./apps/docs/documentation-standards.md)
- [Documentation inventory](./apps/docs/documentation-inventory.md)
- [Core package](./packages/core/README.md)
- [React package](./packages/react/README.md)
- [HTML package](./packages/html/README.md)
- [HTML v1 contracts](./packages/html/docs/VERSION-1.md)

## Contributing

This repository is under active pre-1.0 development. Changes to public exports, peer dependencies, schema types, or the HTML registry must update the corresponding documentation and traceability inventory.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the repository workflow.

## License

[MIT](./LICENSE)
