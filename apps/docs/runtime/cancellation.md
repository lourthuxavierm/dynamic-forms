# Cancellation and stale results

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React data-source runtime 0.1.0

## Manager cancellation

Before a new configured load, the manager cancels the previous named controller.
Each run receives a generation number. Only the latest generation may replace
manager state.

When an external signal is supplied, the manager uses it instead of creating an
internal controller. The caller then owns aborting that request.

## React cancellation

`useDataSource` adds a hook-level run counter. Dependency, pagination, search,
enablement, or unmount changes cancel the named source and prevent stale hook
state updates. Abort errors are not presented as user-facing failures.

## Important limitation

Cancellation is cooperative. Function loaders must observe `context.signal`,
and custom fetch implementations must honor the supplied signal. Generation
checks protect state but cannot stop server work that ignores cancellation.

## Application guidance

- Do not retry abort errors automatically.
- Use request identifiers for side-effecting services.
- Keep loading indicators tied to the latest run.
- Dispose managers and hooks when their owner is removed.
- Test rapid search and dependency changes with delayed responses.
