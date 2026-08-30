# Release documentation readiness

Complete this gate before publishing a major package release.

- [ ] Public API generation and drift checks pass.
- [ ] Breaking changes identify the old and replacement contracts.
- [ ] Package and schema migration steps are executable and ordered.
- [ ] Supported React or Angular major-version changes are documented.
- [ ] Renderer compatibility and maturity tables are updated.
- [ ] Known failure text and symptoms are present in troubleshooting.
- [ ] Upgrade, rollback, and data-compatibility checks are documented.
- [ ] Examples and browser tests pass against the release candidate.
- [ ] Support and documentation owners have reviewed the guidance.

## Rollback contract

Before rollout, determine whether schemas or persisted values written by the new
version remain readable by the previous version. If they do not, use a forward
fix or a tested data migration; a package downgrade alone is not a rollback.

The release owner records the completed checklist with the release evidence.

## Zod adapter gate

Run `pnpm verify:zod-release` before publishing `@lourthuxavierm/dynamic-forms-zod`. Its CI
release job depends on all four pinned Zod compatibility cells, then verifies
the package build, declarations, ESM/CommonJS loading, documentation/API drift,
and packed npm artifact. Follow the package `RELEASE.md` for publication order
and incident rollback.
