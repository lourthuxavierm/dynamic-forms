# Choose an integration

- Status: Documented
- Owner: Documentation maintainers with package owners
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0
- Prerequisites: A TypeScript application

## Current choices

| Goal | Packages | Status |
| --- | --- | --- |
| Use schemas and runtime without UI | `@dynamic-form-engine/core` | Implemented |
| Build a custom React renderer | Core and `@dynamic-form-engine/react` | Documented |
| Render complete browser-native controls through React | Core, React, and `@dynamic-form-engine/react-html` | Documented and recommended |
| Build a custom Angular renderer | Core and `@dynamic-form-engine/angular` | Experimental |
| Evaluate browser-native controls through Angular | Core, Angular, and `@dynamic-form-engine/angular-html` | Experimental 15-type baseline |
| Keep an existing `@dynamic-form-engine/html` import | `@dynamic-form-engine/html` | Compatibility-only |
| Render directly to the DOM without a framework | No package | Planned |

## Recommendation

Choose React HTML for the complete documented renderer. Choose Angular only for
an evaluation that accepts Experimental API and control-coverage changes. The
Angular path currently lacks full control parity, layouts, structures,
SSR/hydration certification, and the complete accessibility release matrix.

Continue with [installation](./installation.md), the
[Angular installation](../integrations/angular/installation.md), or the
[React HTML integration](../integrations/react-html/index.md).
