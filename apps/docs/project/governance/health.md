# Documentation health dashboard

- Status: Automated
- Owner: Documentation maintainers
- Last verified: 2026-08-28
- Applies to: Critical documentation control surfaces

The health audit turns freshness and ownership into a failing CI check. Run
`pnpm docs:health` for a concise result or invoke the underlying script with
`--json` for machine-readable evidence.

## Current baseline

| Area | Accountable owner | Verified | Maximum age |
| --- | --- | --- | --- |
| Standards | Documentation maintainers | 2026-08-22 | 180 days |
| Feature maturity | Documentation and package owners | 2026-08-27 | 120 days |
| Compatibility | Core and integration maintainers | 2026-08-27 | 120 days |
| Ownership and governance | Documentation maintainers | 2026-08-28 | 120 days |
| Generated API | Package and documentation owners | 2026-08-27 | 120 days |
| Examples | Example and renderer maintainers | 2026-08-27 | 120 days |
| Enterprise guidance | Architecture and platform maintainers | 2026-08-27 | 120 days |
| Operations and migration | Documentation and package owners | 2026-08-28 | 120 days |

The executable source is
[`health-baseline.json`](./health-baseline.json). A displayed table is
informational; the JSON baseline and page metadata are compared in CI.

## Failure conditions

The audit fails for a missing critical page, missing or changed owner, mismatched
verification date, duplicate area identifier, future date, expired review age,
or missing health-test artifacts.

## Scheduled monitoring

Documentation CI runs on pull requests, pushes to `main`, manual dispatch, and
monthly at 03:17 UTC on the first day. A scheduled failure is maintenance work,
not a reason to extend a date without reviewing its claims.
