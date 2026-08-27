# Angular Reactive Forms

- Status: Experimental whole-form CVA; FormGroup projection deferred
- Owner: Angular and forms maintainers
- Last verified: 2026-08-27
- Applies to: `DynamicFormsValueAccessor`

The standalone `[dfValueAccessor]` directive implements Angular's
`ControlValueAccessor` for the complete Dynamic Forms value. `writeValue`
updates Core, and Core value changes emit the complete current value outward.

The first slice does not yet publish the proposed per-field `FormGroup` bridge.
Disabled-state propagation is intentionally minimal and must not be treated as
certified Forms interoperability. Full touched, disabled, error, pending,
`updateOn`, array-identity, and feedback-loop tests remain release gates.
