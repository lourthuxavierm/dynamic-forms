# Dynamic Forms — Repository Analysis

- Original analysis: 24 August 2026
- Architecture updated: 25 August 2026
- Repository version: 0.1.0

## Current architecture

Dynamic Forms is organized into three runtime layers:

```text
@lourthuxavierm/dynamic-forms-core
        |
        v
@lourthuxavierm/dynamic-forms-react
        |
        v
@lourthuxavierm/dynamic-forms-react-html
```

Core owns portable form behavior, React owns lifecycle and subscriptions, and HTML owns accessible browser-native rendering. Examples remain adapter-neutral. The Zod, React Hook Form, JSON Schema, and DevTools packages are placeholders.

## Strengths

- Clear dependency direction and package-boundary enforcement
- Framework-independent state, validation, conditions, dependencies, events, and data sources
- Renderer-neutral React contracts
- Native controls, structural rendering, layouts, accessibility behavior, and optional static CSS
- Reusable example schemas and fixtures
- Meaningful unit and integration coverage across implemented packages

## Priority findings

### P0 — Root tests must tolerate placeholder packages

The Zod, React Hook Form, and JSON Schema packages run Vitest without test files. Their scripts should use `--passWithNoTests`, omit the task until implementation, or be excluded from the root pipeline.

### P0 — Conditional field validation can use stale controller state

`validateFieldByName` reads `conditionController`, but its callback dependencies omit that controller. Add the dependency and a regression test covering `requiredWhen` after a condition transition.

### P1 — Linting is declared but not configured

The root exposes `pnpm lint`, but Turbo and the workspaces do not define lint tasks. Add ESLint with React Hooks, promise-safety, accessibility, unused-code, and package-import rules.

### P1 — General CI coverage is incomplete

Add a primary workflow that runs frozen installation, package boundaries, linting, type checking, tests, documentation verification, and production builds.

### P1 — Public schema typing is too broad

Replace public `any` fallbacks with precise field-value mappings or `unknown`. Preserve custom field extensibility without allowing `string` to erase standard field-type autocomplete.

### P1 — Dependency refresh errors and races need management

Add cancellation, request generations, stale-response suppression, loading/error state, and centralized rejection handling.

### P2 — Release discipline needs strengthening

Introduce versioning and changelog automation, supported Node.js versions, pinned toolchain versions, packed-package validation, and clear placeholder-package publication rules.

## Recommended sequence

1. Restore trustworthy root test and lint commands.
2. Fix conditional field validation and add regression coverage.
3. Add a complete CI quality workflow.
4. Harden asynchronous dependency refreshes.
5. Improve public schema inference.
6. Validate package exports and establish a release workflow.

## Verification baseline

Before the architecture update, package boundaries, type checking, the production build, and all implemented-package tests passed independently. Re-run these gates after structural repository changes and record the new results in the pull request.
