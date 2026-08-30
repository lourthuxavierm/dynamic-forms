# Dynamic Forms

[![npm version](https://img.shields.io/npm/v/@lourthuxavierm/dynamic-forms-core.svg)](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A TypeScript-first dynamic forms platform with a framework-independent state engine, React and Angular integrations, accessible native HTML renderers, schema-driven validation, conditions, dependencies, and data sources.

Version `0.1.0` is published on npm under the `@lourthuxavierm` scope. The project is pre-1.0, so public APIs may evolve between minor releases.

## Packages

| Package | Purpose | Maturity |
| --- | --- | --- |
| [`@lourthuxavierm/dynamic-forms-core`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-core) | Schema, store, conditions, dependencies, data sources, events, and validation | Implemented |
| [`@lourthuxavierm/dynamic-forms-react`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-react) | React provider, hooks, subscriptions, and renderer-neutral components | Implemented |
| [`@lourthuxavierm/dynamic-forms-react-html`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-react-html) | Accessible native HTML renderer for React | Implemented |
| [`@lourthuxavierm/dynamic-forms-angular`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-angular) | Angular signals, forms, dependency injection, and lifecycle adapter | Implemented |
| [`@lourthuxavierm/dynamic-forms-angular-html`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-angular-html) | Accessible native HTML renderer for Angular | Implemented |
| [`@lourthuxavierm/dynamic-forms-html`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-html) | Compatibility forwarding package for existing HTML consumers | Compatibility |
| [`@lourthuxavierm/dynamic-forms-zod`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-zod) | Zod field and form validation adapter | Implemented |
| [`@lourthuxavierm/dynamic-forms-rhf`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-rhf) | React Hook Form adapter | Placeholder |
| [`@lourthuxavierm/dynamic-forms-json-schema`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-json-schema) | JSON Schema adapter | Placeholder |
| [`@lourthuxavierm/dynamic-forms-devtools`](https://www.npmjs.com/package/@lourthuxavierm/dynamic-forms-devtools) | Developer tooling | Placeholder |

The example schemas, documentation site, playgrounds, and visual form builder are private workspace applications and are not published as npm packages.

## Architecture

```text
FormSchema
    |
    v
@lourthuxavierm/dynamic-forms-core
  FormStore, validation, conditions, dependencies, data sources, events
    |
    v
@lourthuxavierm/dynamic-forms-react
  FormProvider, hooks, subscriptions
    |
    v
@lourthuxavierm/dynamic-forms-react-html
  HtmlForm, native controls, layouts, registry, optional static CSS
```

Core contains no framework or renderer logic. React owns lifecycle and subscription integration. HTML owns browser-native rendering, accessibility, layouts, and styling.

## Quick start

Install the React runtime and renderer:

```bash
npm install @lourthuxavierm/dynamic-forms-core @lourthuxavierm/dynamic-forms-react @lourthuxavierm/dynamic-forms-react-html react react-dom
```

For Angular, install the headless adapter and native HTML renderer:

```bash
npm install @lourthuxavierm/dynamic-forms-core @lourthuxavierm/dynamic-forms-angular @lourthuxavierm/dynamic-forms-angular-html
```

Zod validation is available separately:

```bash
npm install @lourthuxavierm/dynamic-forms-zod zod
```

Import the optional default stylesheet once:

```ts
import '@lourthuxavierm/dynamic-forms-react-html/styles.css';
```

Create a schema and render it with `FormProvider` and `HtmlForm`:

```tsx
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormProvider } from '@lourthuxavierm/dynamic-forms-react';
import { HtmlForm } from '@lourthuxavierm/dynamic-forms-react-html';

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

See the [React HTML package README](./packages/react-html/README.md) for registry overrides, layouts, styling, accessibility, performance, and specialized controls. Existing `@lourthuxavierm/dynamic-forms-html` imports remain available through the [compatibility package](./packages/html/README.md).

## Workspace development

Requirements:

- Node.js compatible with the installed toolchain
- pnpm 10.15.0

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm --filter @dynamic-forms/react-html-playground dev
```

## Documentation

- [Documentation site](./apps/docs/index.md)
- [Documentation standards](./apps/docs/documentation-standards.md)
- [Documentation inventory](./apps/docs/documentation-inventory.md)
- [Core package](./packages/core/README.md)
- [React package](./packages/react/README.md)
- [React HTML package](./packages/react-html/README.md)
- [React HTML v1 contracts](./packages/react-html/docs/VERSION-1.md)
- [Legacy HTML compatibility package](./packages/html/README.md)

## Contributing

This repository is under active pre-1.0 development. Changes to public exports, peer dependencies, schema types, or the HTML registry must update the corresponding documentation and traceability inventory.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the repository workflow.

## License

[MIT](./LICENSE)
