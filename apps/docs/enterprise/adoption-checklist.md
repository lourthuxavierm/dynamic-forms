# Enterprise adoption checklist

Copy this checklist into the architecture decision record and link evidence.
An unchecked item is an explicit risk, not an implied library responsibility.

## Architecture and ownership

- [ ] System context, data flow, trust zones, and dependency failure modes reviewed.
- [ ] Schema, business, platform, security, accessibility, and operations owners named.
- [ ] Supported packages, renderers, browsers, Angular/React versions, and maturity recorded.
- [ ] Schema versioning, compatibility, draft migration, retention, and rollback approved.

## Security and privacy

- [ ] Server authorization and writable-field allowlists verified independently of UI state.
- [ ] Schema source, integrity, control allowlist, size, and evaluation limits enforced.
- [ ] Data classification, minimization, encryption, retention, deletion, and log redaction approved.
- [ ] Upload quarantine, scanning, storage, download authorization, and cleanup tested.
- [ ] Threat model and abuse/resource-exhaustion tests reviewed.

## Experience and accessibility

- [ ] Localization, time-zone, currency, and canonical-value policies tested.
- [ ] Keyboard, screen-reader, zoom/reflow, contrast, and error/focus evidence retained.
- [ ] Long-running session, expiry, offline, conflict, resume, and abandonment behavior approved.
- [ ] Design-system adapters pass value and accessibility contract tests.

## Operations and delivery

- [ ] Structured server errors, idempotency, cancellation, and retry budgets tested.
- [ ] SLOs, metrics, traces, privacy-safe logs, audit records, dashboards, and alerts owned.
- [ ] Performance budgets tested with representative schemas and devices.
- [ ] Staged deployment, stop conditions, rollback, incident response, and support runbooks rehearsed.

## Decision

Record **approve**, **approve with time-bound risks**, or **reject**, plus approvers,
evidence links, conditions, review date, and package maturity. Reassess after a
major schema/runtime upgrade, material threat change, or accessibility incident.
