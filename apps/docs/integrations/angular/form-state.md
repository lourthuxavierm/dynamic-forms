# Angular form state and signals

- Status: Experimental
- Owner: Angular maintainers
- Last verified: 2026-08-27
- Applies to: `DynamicFormFacade` and `DynamicFieldSignals`

The form exposes readonly `state`, `values`, `valid`, and `submitting` signals.
`field(path)` exposes focused value, error, touched, dirty, visible, disabled,
required, and read-only signals plus value/touch/reset commands.

Store subscriptions update signals explicitly, so the adapter works with
zoneless change detection. A change to Core remains the only mutation path.
Nested paths are read through Core path access rather than direct object indexing.
