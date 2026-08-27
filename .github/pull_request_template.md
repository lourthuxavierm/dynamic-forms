## Summary

Describe the user-visible outcome and the affected packages or documentation areas.

## Change impact

Check each applicable contract. If checked, include its documentation and test in this pull request.

- [ ] Public API changed: generated API reference and canonical guide are updated.
- [ ] New control or control behavior: control reference, compatibility, example, and tests are updated.
- [ ] Schema configuration changed: schema guide, serialization notes, and tests are updated.
- [ ] Breaking change: migration guide, replacement, removal timing, and rollback notes are included.
- [ ] Renderer difference changed: framework compatibility and affected integration guides are updated.
- [ ] New example or playground state: automated test and reproducible documentation link are included.
- [ ] None of the above; no public documentation impact.

## Verification

- [ ] `pnpm docs:governance`
- [ ] Relevant package tests and type checking
- [ ] `pnpm docs:verify`
- [ ] `pnpm docs:build`
- [ ] Browser or accessibility checks when user interaction changed

## Release and operations

- [ ] Maturity, compatibility, security, accessibility, and performance implications were reviewed.
- [ ] A major release has completed the documentation [release audit](../apps/docs/project/governance/release-audit.md).
- [ ] Rollback and persisted-data compatibility are understood, or this does not affect deployment.
