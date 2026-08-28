# @dynamic-forms/zod

Zod validation adapter foundation for Dynamic Forms.

## Current maturity

This package remains **Placeholder**. Phase 1 provides buildable structural
types and package boundaries, but it does not yet export form or field validator
factories.

Do not use the package for application validation until the behavior,
compatibility matrix, documentation, and release gate are complete.

## Architecture

- Depends on `@dynamic-forms/core`.
- Keeps Zod out of Core and renderer packages.
- Targets candidate peer ranges `^3.25.0 || ^4.0.0`.
- Uses a structural asynchronous schema contract in declarations.
- Will validate without silently applying parsed/transformed output to FormStore.

See `docs/architecture/decisions/zod-adapter.md` for the accepted decision.
