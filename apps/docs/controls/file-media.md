# File and media controls

- Status: Documented
- Owner: React HTML maintainers
- Last verified: 2026-08-26
- Applies to: React HTML v1 controls

| Type | Stored value | Main limitation |
| --- | --- | --- |
| `file` | `File` or `null` | Browser file inputs remain uncontrolled. |
| `multi-file` | `File[]` | Count, size, accept, and duplicate rules apply before updates. |
| `camera` | `File` or `null` | Native capture hint varies by browser/device; file selection is fallback. |
| `signature` | Renderer-defined exported value | Requires `HtmlSignatureProvider`; no built-in capture library. |
| `document-preview` | `File` or previewable source | Object URLs are cleaned up; iframes are sandboxed by default. |

## Schema example

```ts verify
import type { FormSchema } from '@dynamic-form-engine/core';

export const mediaSchema: FormSchema = {
  id: 'media-controls',
  fields: [
    { name: 'resume', type: 'file', config: { accept: '.pdf', maxFileSize: 5_000_000 } },
    { name: 'evidence', type: 'multi-file', config: { accept: 'image/*,.pdf', maxFiles: 3, maxFileSize: 5_000_000, imagePreview: true } },
    { name: 'photo', type: 'camera', config: { accept: 'image/*', imagePreview: true } },
    { name: 'approval', type: 'signature' },
    { name: 'preview', type: 'document-preview', readOnly: true },
  ],
};
```

## Upload boundary

Core schemas do not contain transport functions. `HtmlFileUploadProvider`
supplies trusted upload behavior with progress, cancellation, error, retry, and
stale-run protection. Applications own authentication, multipart encoding,
server validation, malware scanning, persistence, and returned identifiers.

## Privacy and security

Do not serialize `File` objects or raw form values into diagnostics. The safe
snapshot helper exposes only count, MIME type, and byte size. Validate remote
preview URLs, enforce Content Security Policy, and never trust client MIME,
extension, size, or scan results as server evidence.

## Accessibility

Keep the native file input reachable and labeled. Progress and errors require
text announcements. Camera capture and preview are enhancements and cannot be
the only way to provide or understand required content.
