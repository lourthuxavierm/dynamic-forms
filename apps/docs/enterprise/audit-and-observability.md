# Audit trails and observability

Operational telemetry explains system health; an audit trail demonstrates who
performed a business action. Keep them separate even when they share correlation
identifiers.

## Event envelope

Use stable event names and include timestamp, correlation ID, trace ID, schema
ID/version, renderer/version, workflow ID, outcome, duration, and error code.
Add actor and tenant identifiers only according to privacy policy. Never record
passwords, tokens, file contents, or unrestricted form values.

Useful metrics include schema-load latency/failures, render duration, validation
latency, submission outcomes, autosave conflicts, upload failures, abandoned
workflows, and client error rates by supported version. Control label and field
ID cardinality before sending metrics.

## Audit requirements

The authoritative backend records actor, delegated authority, action, target,
before/after references or approved diffs, policy decision, timestamp, and
correlation ID in tamper-evident storage. Define retention, access review,
export, and incident procedures. Client events alone are not an audit record.
