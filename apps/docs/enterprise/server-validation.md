# Server validation and structured errors

Client validation improves feedback; server validation protects business state.
Run authorization and authoritative validation on every submission, using the
schema/business-rule version applicable to the operation.

## Error contract

Return stable machine codes and structured paths, with optional localization
parameters and a correlation ID. Keep user-safe summaries separate from internal
diagnostics.

```json
{
  "code": "validation_failed",
  "correlationId": "01J...",
  "errors": [
    { "path": ["contact", "email"], "code": "already_registered" }
  ]
}
```

Map a field error only when its path still exists and is visible to the actor;
otherwise show a form-level error. Clear a server error when its dependent value
changes or a newer response supersedes it. Sequence requests or cancel stale
ones so slow responses cannot overwrite current state.

Use idempotency keys for retryable submissions. Treat validation, conflict,
authorization, rate-limit, and transient service failures as distinct outcomes.
