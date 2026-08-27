# Documentation release audit

- Status: Required before major release
- Owner: Release maintainer
- Last verified: 2026-08-28

Attach this completed checklist to major-release evidence.

## Product truth

- [ ] Public API generation is current and every stable export is documented.
- [ ] Package names, peer dependencies, maturity, and compatibility are verified.
- [ ] New controls and schema configuration have references, examples, and tests.
- [ ] Renderer differences are explicit in compatibility documentation.

## Adoption and migration

- [ ] Installation and new-user paths pass from a clean environment.
- [ ] Every breaking change has ordered migration and replacement guidance.
- [ ] Schema and persisted-value forward/backward compatibility is understood.
- [ ] Rollout stop conditions and rollback or forward-fix procedure are recorded.

## Quality and operations

- [ ] Documentation verification, build, browser, and accessibility checks pass.
- [ ] Security, privacy, localization, and performance guidance reflects changes.
- [ ] Known errors and symptoms are searchable in troubleshooting.
- [ ] Support findings since the prior release were reviewed for reusable guidance.
- [ ] Documentation and package owners approved their areas.

## Evidence

Record the release candidate, commit, command results, reviewers, exceptions with
expiry dates, and links to migration or incident evidence. An unchecked item
blocks a major release unless an accountable owner records a time-bounded exception.
