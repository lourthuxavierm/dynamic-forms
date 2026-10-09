# API stability, versioning, and deprecation

This policy applies to `@dynamic-form-engine/core` from `1.0.0`. It is enforced
by `packages/core/api-report.json`, which records every public export, its
stability tier, and its declaration. CI fails when the source and the report
differ (`pnpm check:api`).

## Stability tiers

| Tier | Marker | Guarantee |
| --- | --- | --- |
| Stable | no marker (default) | Covered by semantic versioning. Removed or changed incompatibly only in a major release, after deprecation. |
| Experimental | `@experimental` TSDoc tag | Implemented and tested, but the contract may change in a **minor** release. Changes are listed in the changelog. |
| Internal | `@internal` TSDoc tag, or not exported from the package entry point | No guarantee. Excluded from the report and the generated API reference. |

A member tagged `@experimental` inside a stable export (for example
`FormRuntime.explainFieldState` or `FormRuntimeOptions.diagnostics`) is
experimental even though its owner is stable.

Current experimental surface:

- **Diagnostics**: `FormRuntime.explainFieldState`, `FormRuntime.diagnostics`,
  `FormRuntimeOptions.diagnostics`, `explainCondition`, `describeValueType`,
  the `*Diagnostic`/`*Explanation` types, `DataSourceManagerOptions.onRequest`,
  `DependencyControllerOptions.onRefresh`, and the `onTransition`
  `ConditionController` argument.
- **Performance guardrails**: `CORE_PERFORMANCE_BUDGETS`, `CorePerformanceBudgets`.
- **Composition primitives**: `CorePluginHost`. Install plugins through
  `FormRuntimeOptions.plugins` instead.

`api-report.json` is the authoritative list.

## What semantic versioning covers

For stable exports, a **patch** release fixes bugs without changing public
declarations. A **minor** release may add exports, optional parameters,
optional properties, union members on *input* types, and overloads. A **major**
release is required to:

- remove or rename an export, method, or property;
- add a required parameter or required input property;
- narrow a parameter type or widen a return type;
- add members to a union that consumers must handle exhaustively (for example
  `FormEventType`, `ConditionOperator`, `RuntimeLifecyclePhase`);
- change documented runtime contracts: lifecycle phase order, event order,
  notification counts in a batch, validation precedence, hidden-value policies,
  path canonicalization, or the schema format (`schemaVersion`).

The schema format is versioned separately by `CURRENT_SCHEMA_VERSION`; see
[SCHEMA.md](./SCHEMA.md). Changing it requires a migration and a major release.

Not covered: exact error message text (error *codes* are covered), performance
numbers, the internal shape of frozen snapshots beyond their declared types,
and anything tagged `@experimental` or `@internal`.

## Deprecation

1. Add `@deprecated` to the declaration with a replacement and a removal target:
   `/** @deprecated Use InferFormValues. Removal: 2.0.0. */`. A public API test
   rejects deprecations missing either.
2. Ship the deprecation in a minor release and list it in the changelog. The
   generated API reference shows the replacement and removal target.
3. Keep the deprecated API working for at least one minor release and until the
   next major.
4. Remove it in the stated major release.

`pnpm api:update` refuses to drop a stable export that was not previously
deprecated, or to demote a stable export to experimental. A major release can
override this with `pnpm api:update --allow-breaking`.

## Promoting an experimental API

An experimental API becomes stable when it has been released for at least one
minor version, has unit and type tests, and has canonical documentation.
Remove the `@experimental` tag and run `pnpm api:update`; the report diff shows
the promotion.

## Making an API change

```sh
pnpm check:api      # fails and lists added / changed / removed exports
pnpm api:update     # accept an intentional change; commit api-report.json
pnpm docs:api       # regenerate the documentation reference
```

Review the `api-report.json` diff like any other code: changed stable
declarations must be backward compatible or wait for a major release.
