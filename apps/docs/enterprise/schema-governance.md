# Schema repositories, ownership, and versioning

Store schemas as reviewed, immutable artifacts. Each schema needs a stable ID,
semantic version, owner, data classification, effective date, supported client
range, migration notes, and retirement date when applicable.

## Ownership model

| Role | Accountability |
| --- | --- |
| Business owner | Meaning, retention, and approval of collected data |
| Schema owner | Field contract, compatibility, and release notes |
| Security/privacy | Threat model, classification, and lawful collection |
| Accessibility owner | Usability criteria and assistive-technology evidence |
| Platform team | Runtime, renderer, tooling, and compatibility policy |
| Operations | Monitoring, rollback, incident response, and support readiness |

Use pull-request review, CODEOWNERS or equivalent approval rules, automated
schema linting, representative fixtures, and environment promotion. Production
must reference an immutable digest rather than a mutable branch name.

## Compatibility rules

- Adding an optional field is normally backward compatible.
- Removing, renaming, changing type, or making a field required is breaking.
- Changing validation can be operationally breaking even when types are stable.
- Persist drafts with both schema ID and version; migrate explicitly or reopen
  with the original supported schema.
- Retain a rollback-compatible schema and renderer for the defined recovery
  window.
