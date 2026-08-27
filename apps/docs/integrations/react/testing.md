# Testing React integration

- Status: Implemented guidance
- Owner: React and quality maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-forms/react` 0.1.0

Test headless integrations with a real `FormStore`, `FormProvider`, and small
probe controls. Assert visible value/error state and user interaction instead of
provider internals. Cover validation modes, invalid submission, conditional
state, data-source results, reset, event cleanup, SSR, and Strict Mode.

The repository's `packages/react/src/phase8.integration.test.tsx` exercises
field subscription isolation, stable actions, nested reset, validation, data
sources, SSR, and Strict Mode cleanup. Public export tests protect the supported
entry point.
