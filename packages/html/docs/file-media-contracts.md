# File and media controls

## Values

Single-file and camera fields store File or null. Multi-file fields store a File
array. The adapter never reads file bytes unless application upload code does so.
File inputs remain uncontrolled because browsers prohibit setting their value.

## Validation

The default controls validate accept MIME/extension rules, maximum byte size,
maximum file count, and duplicates before updating form values. Failures use the
headless field error state and therefore participate in normal error rendering.

Duplicate detection uses name, size, and last-modified internally. These values
are never included in safe diagnostic snapshots.

## Uploads

HtmlFileUploadProvider accepts the transport function outside the Core schema.
The request includes the file, field name, index, AbortSignal, and a bounded
progress callback. Controls expose progress, cancellation, transport errors, and
retry. Stale upload runs cannot overwrite later retries.

Applications own authentication, multipart encoding, server validation, virus
scanning, persistence, and returned asset identifiers.

## Previews and cleanup

Image and document previews use object URLs for File values and revoke them on
replacement or unmount. Document iframes are sandboxed by default. Applications
must still enforce an appropriate Content Security Policy and validate remote
URLs before placing them in form state.

Camera capture uses the native image capture hint. Browser and device support
varies, so normal file selection remains the fallback.

## Signatures

Signature capture is an extension point supplied through HtmlSignatureProvider.
No canvas library, biometric behavior, or adapter-specific function enters Core
schemas.

## Privacy-safe diagnostics

createSafeFileSnapshot returns only count, MIME type, and byte size. It excludes
names, paths, timestamps, file contents, object URLs, and upload credentials.
Never serialize File objects or raw form values into production diagnostics.
