# Migrating HTML compatibility to React HTML

`@dynamic-forms/html` is a compatibility surface. Migrate React rendering code
to the canonical `@dynamic-forms/react-html` package while retaining
`@dynamic-forms/core` for schema and runtime contracts.

## Procedure

1. Inventory imports from `@dynamic-forms/html`.
2. Confirm each symbol in the [compatibility API](../api/generated/html) and its
   canonical [React HTML API](../api/generated/react-html).
3. Replace package imports without changing schema or submission behavior in the same commit.
4. Test control values, validation timing, custom registry entries, focus, and SSR/hydration.
5. Remove the compatibility dependency after no imports remain.

Do not perform a string-only import rewrite when an API has no canonical React
HTML counterpart. Treat that case as an explicit application migration.
