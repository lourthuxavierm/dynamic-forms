# Feature maturity

- Status: Active
- Owner: Documentation maintainers with package owners
- Last verified: 2026-08-29
- Applies to: Repository version 0.1.0

| Label | Meaning |
| --- | --- |
| Planned | No supported public implementation exists |
| Placeholder | A marker exists without a usable integration |
| Experimental | Public implementation and tests exist, but compatibility may change |
| Implemented | Public source and relevant automated behavior exist |
| Documented | Implemented behavior has canonical verified guidance |
| Compatibility-only | Forwarding surface retained for migration |
| Release-ready | Compatibility, accessibility, security, performance, docs, and release gates pass |

## Package maturity

| Package | Maturity | Evidence and boundary |
| --- | --- | --- |
| `@dynamic-form-engine/core` | Implemented | Framework-independent schema, store, validation, conditions, dependencies, data sources, events |
| `@dynamic-form-engine/react` | Documented | Provider, hooks, subscriptions, headless components, integration tests |
| `@dynamic-form-engine/react-html` | Documented | 42-control v1 renderer, structures, layouts, CSS, accessibility and performance references |
| `@dynamic-form-engine/html` | Compatibility-only | Forwards React HTML; no second renderer |
| `@dynamic-form-engine/angular` | Experimental | Angular 22 facade, readonly signals, DI, RxJS, validation, CVA, tests and build |
| `@dynamic-form-engine/angular-html` | Experimental | Angular 22 OnPush native form and 15-type baseline renderer |
| `@dynamic-forms/examples` | Implemented, private | Shared schemas and rules |
| `@dynamic-form-engine/zod` | Release-ready | Validators, pinned dual-major matrix, cross-renderer playground with deterministic visual evidence and browser release gate, integration/API/migration guidance, and packed-artifact release gate |
| `@dynamic-form-engine/rhf` | Placeholder | Marker only |
| `@dynamic-form-engine/json-schema` | Placeholder | Marker only |
| `@dynamic-form-engine/devtools` | Placeholder | Marker only |

## Angular maturity boundary

The Experimental Angular slice has a real zoneless playground and package
tests. It is not Release-ready because full Forms conformance, layouts,
structures, renderer parity, accessibility certification, SSR/hydration, and a
multi-version matrix remain incomplete.
