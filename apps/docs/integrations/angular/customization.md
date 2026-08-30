# Angular customization

- Status: Experimental headless composition
- Owner: Angular maintainers
- Last verified: 2026-08-27
- Applies to: `@lourthuxavierm/dynamic-forms-angular` 0.1.0

Design-system controls consume `DynamicFieldSignals` and render their own
markup. They must preserve Core values, touch semantics, conditions, disabled
and read-only state, accessible naming, errors, and focus behavior.

The proposed renderer-neutral `DynamicFieldOutlet` and DI multi-provider
registry are not included in this first slice. Do not build against the Phase 9
candidate symbol names until those APIs are implemented and tested.
