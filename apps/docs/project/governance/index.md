# Documentation governance

- Status: Active
- Owner: Documentation maintainers
- Last verified: 2026-08-28
- Applies to: All public packages, examples, and documentation

Documentation is a release artifact. Ownership, automated drift detection, and
scheduled review keep public claims aligned with implementation and tests.

## Governance controls

| Control | Enforcement |
| --- | --- |
| Change impact | [Diff-aware policy](./change-impact) and `pnpm docs:governance` |
| Technical ownership | [Ownership map](../documentation-ownership) and CODEOWNERS |
| Pull-request readiness | Repository pull-request template and documentation CI |
| Release readiness | [Release audit](./release-audit) |
| Staleness | [Review cadence](./review-cadence) and visible verification metadata |
| Runtime correctness | Compiled snippets, generated API drift, and browser tests |

## Definition of governed

A public capability is governed only when its implementation, test, canonical
documentation, ownership, maturity, compatibility, and migration impact can be
reviewed together. Passing CI is necessary but does not replace technical review.

## Local commands

```sh
pnpm docs:governance
pnpm docs:verify
pnpm docs:build
pnpm docs:test
```

CI supplies `DOCS_BASE_SHA` to activate change-impact rules. A local run without
that variable still verifies governance structure.
