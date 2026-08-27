# Angular Reactive Forms and CVA

- Status: Proposed
- Owner: Future Angular and forms maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 architecture

The default schema-driven path does not create an Angular `FormControl` for
every Core field. A whole-form `ControlValueAccessor` bridge is proposed for
embedding Dynamic Forms as one Angular control. An explicit `FormGroup` bridge
may support applications requiring per-field interoperability.

Both bridges must define value direction, loop prevention, batching, disabled,
touched, pending and error mapping, nested objects, array identity, reset,
`updateOn`, and teardown. Core validators remain authoritative unless an
explicit error-import policy is configured. Bridge convenience must not obscure
the synchronization and performance cost of maintaining two form models.
