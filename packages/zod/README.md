# @dynamic-forms/zod

Zod validation adapter foundation for Dynamic Forms.

## Current maturity

This package remains **Placeholder**. Phase 2 provides structural types and
deterministic issue mapping, but it does not yet execute schemas through form or
field validator factories.

Do not use the package for application validation until the behavior,
compatibility matrix, documentation, and release gate are complete.

## Architecture

- Depends on `@dynamic-forms/core`.
- Keeps Zod out of Core and renderer packages.
- Targets candidate peer ranges `^3.25.0 || ^4.0.0`.
- Uses a structural asynchronous schema contract in declarations.
- Will validate without silently applying parsed/transformed output to FormStore.

## Available Phase 2 utilities

- `zodPathToFieldPath`
- `zodIssueToValidationIssue`
- `normalizeZodIssue`
- `zodIssuesToFormErrors`

Root issues map to `_form`. Numeric segments use Core bracket notation, such
as `contacts[0].email`. The default keeps the first message for each path;
`errorMode: 'all'` enables deterministic joining.

See `docs/architecture/decisions/zod-adapter.md` for the accepted decision.
