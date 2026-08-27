# Native HTML form values

- Status: Planned renderer integration; Core value contract available
- Owner: Core and future Native HTML maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

The framework-independent value contract belongs to Core. A future Native HTML
renderer must preserve those schema, default-value, normalization, reset, and
submission contracts rather than introduce a second form-state model.

## Required renderer behavior

- DOM input state and the Core store must have a documented source of truth.
- Empty, missing, `null`, numeric, temporal, file, object, and array values must
  follow the canonical [control contracts](../../controls/index.md).
- Programmatic store changes must update visible controls predictably.
- Reset and reinitialization must follow the [runtime reset contract](../../runtime/reset.md).
- Submission must expose Core values without React event objects or component state.

No DOM binding API is published yet. React HTML examples demonstrate React HTML
only and must not be copied here as a standalone API.
