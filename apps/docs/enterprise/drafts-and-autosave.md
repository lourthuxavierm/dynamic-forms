# Draft persistence, autosave, recovery, and retries

Draft storage is a product and data-governance decision. Classify values before
choosing browser, device, or server persistence. Do not place secrets, regulated
identifiers, or files in local storage unless an approved threat model permits it.

## Reliable autosave

Debounce edits, serialize one save per draft, attach an idempotency key and
revision token, and distinguish retryable transport failures from validation,
authorization, conflict, and quota failures. Use bounded exponential backoff
with jitter and stop retrying when the session expires.

Expose `saved`, `saving`, `offline`, `conflict`, and `failed` states without
claiming success before server acknowledgement. A browser unload callback is
best effort and cannot be the only durability mechanism.

## Recovery contract

Persist schema ID/version, canonical values, revision, timestamps, and minimal
workflow state. Encrypt protected drafts at rest and in transit, enforce tenant
boundaries, define retention/deletion, and audit access. Migrate drafts with
reviewed transformations; quarantine rather than guess when migration fails.
