# Runtime behavior

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

The runtime turns initial values and a schema into immutable state snapshots,
events, subscriptions, conditional state, dependency reactions, validation, and
submission.

## Reference

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

## Ownership boundary

Core owns state and framework-neutral processing. React owns lifecycle,
subscriptions, and hooks. React HTML owns browser rendering and normal HTML form
submission. Server persistence and authorization remain application concerns.
