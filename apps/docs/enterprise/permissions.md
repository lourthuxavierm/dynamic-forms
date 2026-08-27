# Permissions and read-only behavior

Visibility, disabled state, and read-only controls are presentation decisions.
They are not security controls. The server must authorize reads, writes,
transitions, and file access for the authenticated actor on every request.

## Capability mapping

Resolve server-issued claims into a small application capability model such as
`profile.view`, `profile.edit`, and `profile.approve`. Map capabilities to schema
presentation in application code or a trusted policy service. Do not embed raw
role names throughout schemas.

For sensitive values, omit the field and its value entirely when the actor may
not read it. Use read-only presentation only when disclosure is permitted but
editing is not. On submit, prefer an explicit writable-field allowlist and
reject unexpected properties rather than silently trusting the browser shape.

## State changes

Recheck authorization after long-running sessions and immediately before
submission. Handle lost permission as a distinct response, preserve only data
allowed by policy, and avoid retry loops that can never succeed.
