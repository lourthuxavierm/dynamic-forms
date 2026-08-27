# Testing and deployment strategy

Test the contract at the cheapest reliable layer and retain a small set of
cross-system journeys. A release must prove schema compatibility, renderer
behavior, security boundaries, accessibility, operational visibility, and rollback.

## Test layers

| Layer | Evidence |
| --- | --- |
| Schema | Parsing, allowlists, migrations, fixtures, compatibility |
| Core | State transitions, conditions, validation, cancellation |
| Adapter/control | Value round-trip, reset, disabled/read-only, focus, errors |
| Browser | Keyboard, assistive states, localization, uploads, recovery |
| Contract | Server error paths, idempotency, concurrency, authorization |
| Operational | Load, telemetry, alert routing, backup and restore |

Promote immutable application and schema artifacts through environments. Use
feature flags or an allowlisted schema cohort for staged rollout, compare failure
and abandonment signals, and define automatic stop conditions. Rollback must
cover application, renderer, schema, and draft compatibility; rehearse it before
high-risk releases.

Production approval needs named security, accessibility, product, platform, and
operations owners. Experimental package status must remain visible in the risk
acceptance record.
