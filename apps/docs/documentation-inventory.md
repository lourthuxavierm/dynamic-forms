# Documentation inventory and traceability

- Status: Active baseline
- Owner: Documentation maintainers
- Last verified: 2026-08-25
- Repository version: 0.1.0

This inventory maps shipped source to its canonical documentation destination.

## Current-state findings

- The canonical package scope is `@dynamic-forms/*`.
- Core, React, React HTML, and Examples contain substantive implementations.
- Zod, React Hook Form, JSON Schema, and DevTools currently expose placeholder constants only.
- The HTML renderer provides native controls, structural rendering, layouts, accessibility contracts, and optional static CSS.

## Package traceability

| Package | Current maturity | Source of truth | Existing documentation | Owner |
| --- | --- | --- | --- | --- |
| `@lourthuxavierm/dynamic-forms-core` | Implemented | `packages/core/src/index.ts` | `packages/core/README.md` | Core maintainers |
| `@lourthuxavierm/dynamic-forms-react` | Implemented | `packages/react/src/index.ts` | `packages/react/README.md` | React maintainers |
| `@lourthuxavierm/dynamic-forms-react-html` | Implemented | `packages/react-html/src/index.ts` and registry entries | `packages/react-html/README.md` and `packages/react-html/docs/*` | React HTML maintainers |
| `@lourthuxavierm/dynamic-forms-html` | Compatibility only | `packages/html/src/index.ts` forwarding entries | `packages/html/README.md` | React HTML maintainers |
| `@dynamic-forms/examples` | Implemented | `packages/examples/src/index.ts` | `packages/examples/README.md` | Example maintainers |
| `@lourthuxavierm/dynamic-forms-zod` | Placeholder | `packages/zod/src/index.ts` | `packages/zod.md` | Adapter owner |
| `@lourthuxavierm/dynamic-forms-rhf` | Placeholder | `packages/rhf/src/index.ts` | `packages/react-hook-form.md` | Adapter owner |
| `@lourthuxavierm/dynamic-forms-json-schema` | Placeholder | `packages/json-schema/src/index.ts` | `packages/json-schema.md` | Adapter owner |
| `@lourthuxavierm/dynamic-forms-devtools` | Placeholder | `packages/devtools/src/index.ts` | `packages/devtools.md` | DevTools owner |

## Baseline maintenance rule

Update this inventory whenever a public export, package maturity, peer dependency, schema field type, or default HTML registry entry changes. A capability becomes documented only after its reference page and verified example exist.
