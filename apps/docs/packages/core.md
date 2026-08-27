# Core package

Status: Implemented. `@dynamic-forms/core` exports schema types and validation, `FormStore` and paths, `FieldRegistry`, conditions, dependencies, data sources, and form events.

Use it for framework-neutral schema and state workflows; see [Core runtime](../concepts/core-runtime.md) and [runtime behavior](../concepts/runtime-behavior.md). It does not render UI, integrate React, or provide backend persistence. Source tests cover paths, immutable state, subscriptions, events, validation, conditions, dependencies, registry behavior, cancellation, cache, and stale results.
