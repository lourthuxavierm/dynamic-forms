# Native HTML rendering

- Status: Planned contract
- Owner: Native HTML maintainers (unassigned until implementation begins)
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

No public API currently converts a `FormSchema` into DOM nodes without React.
Names such as `mountForm`, `renderForm`, or a custom element are deliberately
not proposed here because no reviewed implementation establishes them.

## Required boundary

A future renderer must consume the framework-independent Core contracts while
owning DOM creation, updates, focus, event listeners, and cleanup. It must not
reuse React components behind a framework-neutral name.

```text
FormSchema -> Core store/runtime -> standalone DOM renderer -> HTML elements
                                      |
                                      `-> dispose listeners and DOM ownership
```

Static HTML generation is a separate capability. It must not be implied unless
server rendering, hydration, escaping, and mismatch behavior are implemented
and tested.

## Lifecycle requirements

The eventual rendering contract must specify mount ownership, schema changes,
incremental updates, focus preservation, error handling, reinitialization, and
idempotent disposal. Until these are public and tested, use the
[Core runtime reference](../../runtime/index.md) only for state behavior—not as
evidence that a DOM renderer exists.
