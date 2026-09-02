# Documentation inventory and traceability

- Status: Active baseline
- Owner: Documentation maintainers
- Last verified: 2026-09-03
- Repository version: 0.1.0

This inventory maps shipped source to its canonical documentation destination.

## Current-state findings

- The canonical public package scope is `@dynamic-form-engine/*`.
- Core, React, React HTML, and Examples contain substantive implementations.
- Zod and React Hook Form are release-ready adapters; JSON Schema and DevTools remain placeholders.
- The HTML renderer provides native controls, structural rendering, layouts, accessibility contracts, and optional static CSS.

## Package traceability

| Package | Current maturity | Source of truth | Existing documentation | Owner |
| --- | --- | --- | --- | --- |
| `@dynamic-form-engine/core` | Implemented | `packages/core/src/index.ts` | `packages/core/README.md` | Core maintainers |
| `@dynamic-form-engine/react` | Documented | `packages/react/src/index.ts` | `packages/react/README.md` | React maintainers |
| `@dynamic-form-engine/react-html` | Documented | `packages/react-html/src/index.ts` and registry entries | `packages/react-html/README.md` and `packages/react-html/docs/*` | React HTML maintainers |
| `@dynamic-form-engine/html` | Compatibility-only | `packages/html/src/index.ts` forwarding entries | `packages/html/README.md` | React HTML maintainers |
| `@dynamic-form-engine/angular` | Experimental | `packages/angular/src/index.ts` | `packages/angular/README.md` and `apps/docs/integrations/angular/*` | Angular maintainers |
| `@dynamic-form-engine/angular-html` | Experimental | `packages/angular-html/src/index.ts` | `packages/angular-html/README.md` and `apps/docs/integrations/angular-html/*` | Angular HTML maintainers |
| `@dynamic-forms/examples` | Implemented | `packages/examples/src/index.ts` | `packages/examples/README.md` | Example maintainers |
| `@dynamic-form-engine/zod` | Release-ready | `packages/zod/src/index.ts` | `packages/zod.md` | Adapter owner |
| `@dynamic-form-engine/rhf` | Release-ready | `packages/rhf/src/index.ts` | `packages/react-hook-form.md` | Adapter owner |
| `@dynamic-form-engine/json-schema` | Placeholder | `packages/json-schema/src/index.ts` | `packages/json-schema.md` | Adapter owner |
| `@dynamic-form-engine/devtools` | Placeholder | `packages/devtools/src/index.ts` | `packages/devtools.md` | DevTools owner |

## Baseline maintenance rule

Update this inventory whenever a public export, package maturity, peer dependency, schema field type, or default HTML registry entry changes. A capability becomes documented only after its reference page and verified example exist.
