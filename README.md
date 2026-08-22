# Dynamic Forms

A TypeScript-first dynamic forms monorepo with a framework-independent state engine, React bindings, and a Material UI renderer.

Status: pre-1.0 development (`0.1.0`). Core, React, and MUI are implemented. The Zod, React Hook Form, JSON Schema, and DevTools packages are currently placeholders and should not yet be treated as working integrations.

## Packages

| Package | Purpose | Current maturity |
| --- | --- | --- |
| `@dynamic-forms/core` | Schema, store, conditions, dependencies, data sources, events, and validation | Implemented |
| `@dynamic-forms/react` | React provider, hooks, subscriptions, and renderer-neutral form components | Implemented |
| `@dynamic-forms/mui` | MUI form renderer and default field registry | Implemented |
| `@dynamic-forms/zod` | Planned Zod adapter | Placeholder |
| `@dynamic-forms/rhf` | Planned React Hook Form adapter | Placeholder |
| `@dynamic-forms/json-schema` | Planned JSON Schema adapter | Placeholder |
| `@dynamic-forms/devtools` | Planned developer tooling | Placeholder |

The MUI package declares React 18 or 19, React DOM 18 or 19, MUI 7, and Emotion 11 as peer dependencies.

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
@dynamic-forms/mui
  MuiForm, MuiFormRenderer, default MUI registry
```

Core does not import React or MUI. React owns lifecycle and subscription integration. MUI owns visual rendering and its control registry.

## Quick start

Install the implemented packages and their UI peers:

```bash
pnpm add @dynamic-forms/core @dynamic-forms/react @dynamic-forms/mui
pnpm add react react-dom @mui/material @emotion/react @emotion/styled
```

Create a schema and render it through `FormProvider` and `MuiForm`:

```tsx
import type { FormSchema } from "@dynamic-forms/core";
import { FormProvider, useForm } from "@dynamic-forms/react";
import { MuiForm } from "@dynamic-forms/mui";

const schema: FormSchema = {
  id: "customer",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      validation: { required: true, minLength: 2 },
    },
    {
      name: "customerType",
      type: "select",
      label: "Customer type",
      options: [
        { label: "Individual", value: "individual" },
        { label: "Business", value: "business" },
      ],
    },
    {
      name: "companyName",
      type: "text",
      label: "Company name",
      visibleWhen: {
        field: "customerType",
        operator: "equals",
        value: "business",
      },
    },
  ],
};

export function CustomerForm() {
  const { store, registry } = useForm({
    defaultValues: { customerType: "individual" },
  });

  return (
    <FormProvider store={store} registry={registry} schema={schema}>
      <MuiForm
        schema={schema}
        onSubmit={async (values) => {
          console.log(values);
        }}
      />
    </FormProvider>
  );
}
```

`MuiForm` merges the default MUI registry automatically. Pass its `registry` prop to add or replace MUI controls.

## Built-in MUI field types

The default registry currently contains 42 types:

- Core inputs: `text`, `textarea`, `password`, `email`, `url`, `number`, `integer`, `decimal`, `hidden`
- Selection: `select`, `multi-select`, `autocomplete`, `async-autocomplete`, `checkbox`, `checkbox-group`, `radio`, `radio-group`, `switch`, `toggle-button-group`, `tree-select`
- Date and time: `date`, `time`, `datetime`, `date-range`, `time-range`, `datetime-range`, `month`, `year`
- Specialized: `currency`, `percentage`, `slider`, `range-slider`, `rating`, `phone`, `otp`, `pin`, `mask`
- File and media: `file`, `multi-file`, `camera`, `signature`, `document-preview`

`toggle-button`, `tree-checkbox`, `object`, and `array` exist in schema typing but do not currently have default MUI registry entries.

## Workspace development

Requirements:

- Node.js compatible with the installed toolchain
- pnpm 10.15.0

Common commands:

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm --filter @dynamic-forms/playground dev
```

## Documentation

- [Documentation standards](./apps/docs/documentation-standards.md)
- [Documentation inventory and traceability](./apps/docs/documentation-inventory.md)
- [MUI control inventory](./apps/docs/CONTROL.md)
- [Core package](./packages/core/README.md)
- [React package](./packages/react/README.md)
- [MUI value strategy](./packages/mui/docs/value-strategy.md)
- [MUI runtime conditions and data sources](./packages/mui/docs/runtime-conditions-data-sources.md)
- [File upload behavior](./packages/mui/docs/file-uploads.md)

The VitePress documentation application is planned for Documentation Phase 1.

## Contributing

This repository is under active pre-1.0 development. Changes to public exports, peer dependencies, schema types, or the MUI default registry must update the corresponding documentation and traceability inventory.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the repository workflow.

## License

[MIT](./LICENSE)
