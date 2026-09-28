# Testing React integration

- Status: Implemented guidance
- Owner: React and quality maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/react` 1.0.0-rc (React 18 and 19)

Test headless integrations with a real `FormStore`, `FormProvider`, and small
probe controls. Assert visible value/error state and user interaction instead of
provider internals. Cover validation modes, invalid submission, conditional
state, data-source results, reset, event cleanup, SSR, and Strict Mode.

The repository's React suites cover:

| File | Coverage |
| --- | --- |
| `provider.test.tsx` | Store ownership, context and action stability with inline callbacks, form-level `disabled`/`readOnly`/submitting, events, error routing, abort signals, invalid-submit focus |
| `hooks/hooks.test.tsx` | Every hook: condition state, path spellings, selector equality, inline listeners and configs, arrays, data-source cancellation, typed registration |
| `quality-gates.test.tsx` | 500-field render isolation, SSR and hydration, Strict Mode subscription leaks |
| `phase8.integration.test.tsx`, `components/accessibility.test.tsx` | Integration flows and accessibility wiring |
| `public-api.test.ts` | Runtime exports against `api-report.json`, deprecation metadata, peer dependencies |

When Vitest runs without `globals`, Testing Library cannot register its
automatic cleanup: call `afterEach(() => cleanup())` so DOM from one test does
not leak into the next.
