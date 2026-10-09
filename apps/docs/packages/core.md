# Core package

Status: Implemented. `@dynamic-form-engine/core` exports schema types, validation, normalization, and compilation; `FormStore` with typed paths, transactions, and selector subscriptions; conditions; dependencies; data sources; events; the composed `FormRuntime` with plugins; and experimental diagnostics.

Start with [Core architecture](../concepts/core-architecture.md), then the [runtime reference](../runtime/index.md) and the [validation contract](../runtime/validation.md). Core has no runtime dependencies and no framework, renderer, or DOM dependency; it does not render UI or persist data.

The public API is recorded in `packages/core/api-report.json` with stable and experimental tiers, and changes are gated in CI. See the [API reference](../api/index.md) for the versioning and deprecation policy. Source tests cover every subsystem and runtime export, nested object and array paths, async races, lifecycle order, transactions, disposal, type-level contracts, and performance budgets.
