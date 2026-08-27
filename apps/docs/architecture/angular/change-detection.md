# Angular change detection and zoneless operation

- Status: Proposed
- Owner: Future Angular maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 architecture

The adapter targets OnPush components and signal-driven updates. Correctness
must not rely on `NgZone`, patched timers, or application-wide change detection.
Core callbacks update the adapter's signal projection explicitly, and all
subscriptions/controllers are disposed through Angular lifecycle primitives.

Release tests must run the same value, validation, condition, data-source,
submission, and lazy-control scenarios in zoneless mode and in any declared
zone-based compatibility mode. Performance tests must verify that one field
change does not rerender unrelated controls.
