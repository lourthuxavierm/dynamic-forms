# File upload architecture and security

Form state should hold file metadata and upload state, not treat raw file bytes
as ordinary JSON. Prefer direct upload to quarantined object storage using a
short-lived, size-limited, content-type-limited authorization issued by the
backend.

## Secure flow

1. Backend authorizes the actor and creates an upload intent.
2. Client uploads with an opaque ID and reports progress/cancellation.
3. Storage event triggers malware scanning and content inspection.
4. Backend marks the object accepted only after all policy checks pass.
5. Final form submission references the accepted opaque ID.

Do not trust filename, extension, browser MIME type, image dimensions, or client
checks. Enforce byte limits while streaming, canonicalize display names, prevent
path traversal, isolate quarantine, and serve accepted files with safe response
headers from a separate origin where appropriate.

Define encryption, retention, deletion, legal hold, abandoned-upload cleanup,
download authorization, and audit policy. Never log signed URLs or file contents.
