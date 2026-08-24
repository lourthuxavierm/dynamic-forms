# ADR 0001: Headless React and native HTML adapter boundaries

- Status: Accepted
- Date: 2026-08-23
- Owners: Dynamic Forms maintainers

## Decision

The enforced dependency direction is `core <- react <- visual adapter`.

| Package | Owns | Allowed internal dependencies |
| --- | --- | --- |
| `@dynamic-forms/core` | Schemas, state, validation, rules, dependencies, data sources | None |
| `@dynamic-forms/react` | Providers, hooks, subscriptions, focus and renderer contracts | Core |
| `@dynamic-forms/html` | Native controls, DOM accessibility, registry, static CSS | Core, React |

Core must contain no React, DOM, or adapter details. React must contain no native controls or CSS. Schemas and rules remain adapter-neutral. `pnpm check:boundaries` enforces these rules.

## Supported platforms

- React and React DOM 18.x and 19.x (`^18.0.0 || ^19.0.0`).
- TypeScript 5.x.
- Current and previous two stable major versions of Chrome, Edge, Firefox, and Safari.
- Safari on iOS/iPadOS 16.4+.
- SSR when DOM APIs are not accessed during module evaluation.
- No Internet Explorer or legacy EdgeHTML.

The matrix is reviewed for every major release and twice yearly. Dropping a supported React or browser major is breaking.

## Accessibility contract

The HTML adapter targets WCAG 2.2 AA. Each control requires programmatic naming and descriptions, associated errors, keyboard operation, logical and visible focus, correct disabled/read-only semantics, error announcements, 200% zoom and 400% reflow, reduced-motion, forced-colors, RTL, and text-resizing support. Composite controls also require automated coverage and documented NVDA and VoiceOver checks. Prefer native semantics over ARIA reimplementations.

## Performance budgets

| Metric | Budget |
| --- | --- |
| HTML adapter entry | Under 10 KB gzip, excluding peers and optional CSS |
| Baseline control | Under 2 KB incremental gzip |
| Typical interaction | Under 16 ms p95 on the reference desktop profile |
| Unrelated rerenders | Zero per isolated field update |
| Large form | Publish 500-field initial-render and update results |
| Large array | Windowing extension point for 1,000 items |

Benchmarks must be reproducible and versioned. Increasing a budget requires an ADR and release note.

## API compatibility and deprecation

- Stable APIs follow SemVer; pre-1.0 breaking changes still require migration notes.
- Only exports declared in `package.json` are public.
- Additions are minor, behavior-preserving fixes are patch, and removals, narrower inputs, changed defaults, or dropped platforms are breaking.
- Deprecations require `@deprecated`, replacement guidance, tests, and release notes.
- Stable deprecated APIs remain for at least one minor and normally until the next major.
- Security, privacy, or correctness can accelerate removal when a migration path is documented.

## Consequences

Adapters evolve independently while sharing headless behavior and schemas. Adapter conveniences use extension points rather than leaking into Core. CI rejects architectural drift before runtime work begins.
