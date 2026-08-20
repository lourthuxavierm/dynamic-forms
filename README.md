# Dynamic UI Engine

> A framework-agnostic, TypeScript-first engine for building forms — and eventually any config-driven UI — with a fast, extensible core and a first-class Material UI renderer.

Define your UI as data. Register your own controls. Get fine-grained reactivity, conditional logic, cascading dependencies, and async data sources — without hand-writing repetitive form code.

[![npm version](https://img.shields.io/npm/v/@dynamic-ui/core.svg)](https://www.npmjs.com/package/@dynamic-ui/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)

---

## Why this exists

Most dynamic-form libraries force a choice: either you get JSON Schema (verbose, not built for UI) or a drag-and-drop builder (rigid, hard to extend). Meanwhile, large forms in real enterprise apps re-render far more than they should, and "customization" usually means forking the library.

**Dynamic UI Engine** takes a different approach:

- **A schema built for UI, not data validation.** JSON Schema is supported as an *adapter*, not the foundation.
- **A framework-free core.** `@dynamic-ui/core` has zero React or MUI dependencies — it's a portable state machine for forms that any renderer can sit on top of.
- **Fine-grained reactivity by design.** Changing one field re-renders that field and its dependents — not the other 99.
- **An extensible registry, not a closed set of controls.** Add your own field types without touching the core package.
- **MUI as the flagship renderer**, built against the current MUI v9 / Base UI foundation — with Angular, Angular Material, and Vue adapters planned.

Forms are the first use case. The same engine is designed to eventually drive wizards, filters, search panels, settings pages, CRUD editors, and admin/config screens — anywhere a UI can be described as configuration.

---

## Architecture

```
                    Your Form Schema (JSON/TS)
                              │
                              ▼
                    ┌───────────────────┐
                    │   Dynamic Core     │   zero React, zero MUI
                    │  (@dynamic-ui/core)│
                    │                    │
                    │  • Schema parser   │
                    │  • FormStore       │
                    │  • Field Registry  │
                    │  • Condition Engine│
                    │  • Dependency Graph│
                    │  • DataSource      │
                    │  • Validation      │
                    │  • Event Bus       │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  React Bindings    │   thin adapter, fine-grained
                    │ (@dynamic-ui/react)│   per-field subscriptions
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ React Hook Form    │   optional bridge, not a
                    │   (bridge)         │   Core dependency
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   MUI Renderer     │
                    │  (@dynamic-ui/mui) │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┬──────────────┐
              ▼               ▼                ▼              ▼
          TextField        Select        Autocomplete      Custom
                              ▼
                          MUI 9 / Base UI
```

`@dynamic-ui/core` never imports React or MUI. Every renderer — React, Angular, Vue — is a consumer of the same engine.

---

## Packages

```
dynamic-ui-engine/
│
├── packages/
│   ├── core/            # Framework-free engine — schema, registry, conditions,
│   │                     # dependencies, data sources, validation, state, events
│   ├── react/            # DynamicForm, DynamicField, hooks — thin React bindings
│   ├── react-hook-form/  # Optional RHF bridge
│   ├── mui/              # MUI v9 renderer and built-in controls
│   ├── zod/              # Zod validation adapter
│   ├── json-schema/       # JSON Schema → Dynamic Schema adapter
│   └── devtools/          # Inspector for state, conditions, dependency graph
│
├── apps/
│   ├── docs/
│   ├── playground/
│   └── builder/           # visual builder — post-1.0
│
└── examples/
```

---

## Quick start

```bash
npm install @dynamic-ui/core @dynamic-ui/react @dynamic-ui/mui
```

```tsx
import { DynamicForm } from "@dynamic-ui/react";
import { muiRenderer } from "@dynamic-ui/mui";

const schema = {
  version: "1",
  fields: [
    { name: "firstName", type: "text", label: "First Name", required: true },
    { name: "customerType", type: "select", label: "Customer Type",
      options: [{ label: "Individual", value: "individual" }, { label: "Business", value: "business" }] },
    { name: "companyName", type: "text", label: "Company Name",
      visibleWhen: { field: "customerType", operator: "equals", value: "business" } },
    { name: "country", type: "autocomplete", label: "Country",
      dataSource: { type: "url", url: "/api/countries" } },
    { name: "state", type: "autocomplete", label: "State",
      dependsOn: ["country"],
      dataSource: { type: "url", url: "/api/states", params: { countryId: "$country" } } },
  ],
};

export function CustomerForm() {
  return (
    <DynamicForm
      schema={schema}
      renderer={muiRenderer}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

### Registering a custom control

```ts
import { createFieldRegistry } from "@dynamic-ui/core";

const registry = createFieldRegistry();

registry.register("customer", {
  component: CustomerSelector,
  valueType: "object",
});
```

```json
{ "name": "customer", "type": "customer", "label": "Customer" }
```

---

## Core concepts

| Concept | Purpose |
|---|---|
| **Schema** | Strongly typed, declarative description of your form — fields, layout, validation, conditions, dependencies |
| **Field Registry** | Maps a `type` string to a component; register your own without touching core |
| **Condition Engine** | `visibleWhen`, `disabledWhen`, `requiredWhen`, `readonlyWhen`, with `equals`, `contains`, `and`/`or`/`not`, etc. |
| **Dependency Graph** | Cascading fields — e.g. `country → state → city` — with automatic reset and reload |
| **DataSource** | Static, async, URL-based, searchable, paginated, and cached data for select/autocomplete fields |
| **FormStore** | Values, errors, touched, dirty, and loading state, with fine-grained per-field subscriptions |
| **Event Bus** | Field and form lifecycle events for plugins, logging, and DevTools |

---

## Design goals

- **No unnecessary re-renders.** Changing field #37 in a 500-field form re-renders field #37 and its dependents — not the other 499.
- **Core stays framework-free.** `@dynamic-ui/core` has no React, MUI, or Angular imports. Renderers are consumers.
- **Open field types.** `type` is a `string`, resolved through the registry — never a closed union that forces a core release to extend.
- **Validation is pluggable.** Zod ships first; other validators are adapters, not hard dependencies.
- **JSON Schema is a target, not the foundation.** Import existing JSON Schema forms via `@dynamic-ui/json-schema`, but the native schema is designed for UI first.

---

## Roadmap

- **v0.1** — Schema → Field Registry → MUI renderer. Core validation and conditional visibility.
- **v0.2** — Dependency graph, async data sources, full validation pipeline.
- **v0.3** — Custom controls, nested fields, arrays, layouts.
- **v0.5** — DevTools, schema editor.
- **v1.0** — Visual drag-and-drop builder.
- **Beyond** — Angular / Angular Material adapter, Vue adapter, wizards, permissions, additional enterprise controls (AsyncAutocomplete, RemoteSelect, Currency, Address, UserSelector, DataGrid).

---

## Tech stack

TypeScript · React 18/19 · MUI 9 · React Hook Form (optional) · Zod · Vitest · Testing Library · Playwright · Vite · pnpm · Turborepo · Storybook

---

## Contributing

This project is in early development — contributions, design feedback, and issue reports are welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup instructions and the monorepo workflow.

## License

[MIT](./LICENSE)