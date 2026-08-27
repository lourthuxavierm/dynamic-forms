# Documentation review cadence

- Status: Active
- Owner: Documentation maintainers
- Last verified: 2026-08-28

## Every pull request

Review correctness, ownership, maturity, links, compiled examples, API drift,
accessibility impact, and change-impact companions.

## Every release

Audit public APIs, package installation, support ranges, compatibility matrices,
deprecations, migration guidance, examples, and known troubleshooting symptoms.

## Quarterly

Query pages by their visible `Last verified` metadata. Review expired claims,
broken external links, obsolete screenshots, search gaps, repeated support
findings, and pages whose owner is no longer active. Record the audit date and
issues; do not refresh a date without verifying the page.

## Twice yearly

Review information architecture, duplicated concepts, user journeys, ownership
coverage, enterprise guidance, and whether navigation reflects product maturity.

## Before each major release

Complete the [release audit](./release-audit), including migrations, rollback,
compatibility evidence, API generation, accessibility, security, performance,
and operational support readiness.

## Stale-content rule

A page is stale when its verification date exceeds its area cadence, its owner is
unassigned, its version scope no longer matches policy, or implementation/tests
contradict its claims. Stale content must be corrected, explicitly marked, or
removed from supported guidance.
