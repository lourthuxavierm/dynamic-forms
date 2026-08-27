# Migrating React major versions

React compatibility is governed by the supported range in the
[framework compatibility policy](../project/framework-compatibility).

## Upgrade checks

- Upgrade React and its DOM package together.
- Confirm the installed Dynamic Forms peer-dependency range before installation.
- Exercise provider mounting, subscription cleanup, Strict Mode, error boundaries,
  and current-state submission.
- Run server rendering and hydration with identical initial schema and values.
- Recheck custom controls for ref, event, and focus behavior.
- Profile large forms; a successful render does not prove stable rerender cost.

When a future React major requires product changes, add a version-specific
old/new example and rollback notes here before declaring support.
