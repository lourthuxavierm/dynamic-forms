# Backend-driven schemas and trust boundaries

Backend-driven forms reduce duplicated release work, but executable behavior
must not cross the browser boundary without validation. Accept declarative
schema data only; never evaluate server-provided JavaScript, templates, regular
expressions without limits, or arbitrary component names.

## Recommended flow

```text
Author -> reviewed repository -> signed/versioned publication -> gateway/cache
       -> application schema allowlist -> Dynamic Forms -> submitted values
       -> authoritative server authorization and validation
```

The application should verify schema identity, supported version, size, field
count, control allowlist, dependency depth, and data-source origins before form
creation. Reject unknown properties when the schema contract requires strict
handling. Apply response-size and evaluation-time limits to prevent resource
exhaustion.

## Trust zones

- The schema authoring system is privileged and requires least-privilege access.
- Publication is immutable; promotion between environments preserves identity.
- Browser caches are performance aids, never sources of authority.
- Submission endpoints derive permissions from the authenticated actor and
  current server state, not hidden or disabled controls.
- Logs redact classified values and schema-supplied secrets.

## Failure policy

Fail closed for unknown controls, unsupported schema versions, invalid
signatures, and authorization uncertainty. Show a stable incident identifier to
the user, preserve safe draft data where policy permits, and emit an operational
event without logging the rejected payload.
