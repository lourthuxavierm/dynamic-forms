# Changelog

Notable changes to published `@dynamic-form-engine/*` packages. Stability tiers
and what counts as breaking are defined in `packages/core/STABILITY.md`.

## Unreleased

### @dynamic-form-engine/core

**Added**

- Public API report (`packages/core/api-report.json`) with stable and
  experimental tiers, enforced by `pnpm check:api` in CI, and the
  `STABILITY.md` versioning and deprecation policy shipped in the package.
- Experimental runtime diagnostics: `FormRuntime.explainFieldState`, the opt-in
  `FormRuntime.diagnostics` trace, `explainCondition`, and
  `DataSourceManagerOptions.onRequest`.

**Fixed**

- Type declarations were unresolvable for Node ESM consumers using
  `moduleResolution: node16`/`nodenext`: every export appeared missing. Published
  declarations now use fully specified relative imports.
- `resetOnDependencyChange` and dependent data-source refreshes now fire when a
  dependency changes through an ancestor replacement (`setValue('profile', …)`)
  or a descendant edit (`items[0].code` for a dependency on `items`), and for
  either array-path spelling.
- Data-source `$path` URL parameters accept bracket array segments
  (`$items[0].code`).
- Dirty, touched, and error state are tracked consistently for nested paths and
  for equivalent `items[0]` / `items.0` spellings.
- `VERSION` now reports the package version (`1.0.0-rc.1`) instead of `0.1.0`.

**Deprecated**

- `InferSchemaType`: use `InferFormValues`. Removal: 2.0.0.
