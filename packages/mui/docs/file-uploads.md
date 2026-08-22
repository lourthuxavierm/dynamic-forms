# File upload controls

`MuiFileUpload` and `MuiMultiFileUpload` provide selection, drag/drop, validation, previews, removal, and optional upload orchestration. Upload networking is intentionally injected through the `uploader` prop; the MUI package does not assume an HTTP client, endpoint, authentication mechanism, or storage provider.

## Values

Without an uploader, form state contains the selected browser `File` object (or an array for `multi-file`). With an uploader, the raw `File` is stored while work is pending and replaced after success by `MuiExistingFile`:

```ts
interface MuiExistingFile {
  id: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  metadata?: Readonly<Record<string, unknown>>;
}
```

Existing server values can be used as initial/default form values and remain removable. Download links open with `noopener noreferrer`.

## Upload transport

```tsx
<MuiFileUpload
  name="invoice"
  accept="application/pdf"
  maxFileSize={10 * 1024 * 1024}
  uploader={async (file, { signal, onProgress }) => {
    // Send with the application's authenticated API client.
    // Connect cancellation to `signal` and report 0..100 through `onProgress`.
    return { id: 'server-id', name: file.name, downloadUrl: '/files/server-id' };
  }}
/>
```

Rejected uploads retain the raw file so the user can retry. Cancel aborts the transport through `AbortSignal`. Removing or unmounting a control aborts active work.

## Schema configuration

`FileFieldConfig` supports `accept`, `maxFileSize` (bytes), `maxFiles`, and `imagePreview`. Explicit component props override schema configuration. Default registry keys are `file` and `multi-file`.

## Security and operations

Client validation is usability feedback, not a security boundary. The server must independently validate size, content type, extension, file signature, authorization, malware policy, and storage quotas. Treat file names and metadata as untrusted. Prefer authenticated download handlers or short-lived signed URLs for private files. The application owns resumable/chunked upload protocols; they can be implemented behind the same uploader contract.
## Advanced media controls

- `MuiCameraCapture` requests the platform image capture picker with `capture="user"` or `capture="environment"`. Desktop and unsupported mobile browsers safely fall back to file selection; applications must not assume direct camera access.
- `MuiSignaturePad` stores a `MuiSignatureValue` containing PNG data, dimensions, and capture time. It captures a drawn mark only—it does not prove identity, intent, certificate validity, or legal enforceability. Persist and audit signatures according to application policy.
- `MuiDocumentPreview` renders images directly and PDFs in a sandboxed, no-referrer iframe. Unsupported formats receive a metadata/download fallback instead of being injected into the DOM. Private preview URLs should be authenticated or short-lived.

Large signatures and files should normally be uploaded and replaced by server references before long-term form persistence. Avoid logging base64 signature data or sensitive download URLs.
