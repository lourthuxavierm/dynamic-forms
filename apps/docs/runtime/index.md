# Runtime behavior

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc and React

The runtime turns initial values and a schema into immutable state snapshots,
events, subscriptions, conditional state, dependency reactions, validation, and
submission.

## Reference

- [Core architecture](../concepts/core-architecture.md)
- [Form lifecycle](./form-lifecycle.md)
- [FormStore](./form-store.md)
- [Form state](./form-state.md)
- [Field state](./field-state.md)
- [Events](./events.md)
- [Subscriptions](./subscriptions.md)
- [Conditions](./conditions.md)
- [Dependencies](./dependencies.md)
- [Data sources](./data-sources.md)
- [Cache](./cache.md)
- [Cancellation](./cancellation.md)
- [Reset](./reset.md)
- [Submission](./submission.md)
- [Validation contract](./validation.md)
- [Diagnostics and explainability](./diagnostics.md)

## Ownership boundary

Core owns state and framework-neutral processing. React owns lifecycle,
subscriptions, and hooks. React HTML owns browser rendering and normal HTML form
submission. Server persistence and authorization remain application concerns.
