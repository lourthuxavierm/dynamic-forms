# Core architecture

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc

`@dynamic-form-engine/core` is the framework-, renderer-, and DOM-independent
engine behind every Dynamic Forms adapter. It has no runtime dependencies and
uses only universal platform APIs (`fetch`, `URL`, `AbortController`,
`structuredClone`, `queueMicrotask`), so it runs unchanged in browsers,
Node.js, workers, and server runtimes.

## Module map

| Module | Owns | Main exports |
| --- | --- | --- |
| `schema` | Public schema types, value inference, validation, normalization, compilation, migrations | `FormSchema`, `InferFormValues`, `validateSchema`, `normalizeSchema`, `compileSchema`, `explainField` |
| `store` | Immutable state, typed paths, transactions, selectors, events | `FormStore`, `Path`, `PathValue`, `getByPath`, `setByPath`, `normalizePath` |
| `conditions` | `visibleWhen` / `disabledWhen` / `requiredWhen` / `readOnlyWhen`, hidden-value policies | `ConditionController`, `evaluateCondition` |
| `dependencies` | `dependsOn` graph, cycle detection, dependent resets and refreshes | `DependencyGraph`, `DependencyController` |
| `datasource` | Static, function, and URL sources; cache; cancellation; stale protection | `DataSourceManager` |
| `validation` | Built-in rules and form validators | `createFormValidator`, `createFieldValidators`, `validateField` |
| `async` | Request generations, abort signals, last-write-wins | `AsyncRequestManager` |
| `events` | Typed event emitter | `FormEventEmitter`, `FormEvent` |
| `runtime` | Composition of the modules above with a fixed lifecycle order | `FormRuntime`, `createFormRuntime` |
| `plugins` | Read-only plugin context, lifecycle hooks, mutation interceptors | `CorePlugin`, `createLifecycleAuditPlugin` |
| `diagnostics` | Opt-in explanations and a bounded trace (experimental) | `FormRuntime.explainFieldState`, `FormRuntime.diagnostics` |
| `registry` | Framework-agnostic field-type registry for adapters | `FieldRegistry` |

## Layering

```text
                 FormRuntime  ── plugins, diagnostics
                      │ owns and orders
   ┌──────────┬───────┴────────┬──────────────┐
ConditionController  DependencyController  DataSourceManager
   └──────────┴───────┬────────┴──────────────┘
                 FormStore  (state, paths, batch, events, selectors)
                      │
      schema (compiled, frozen)   validation   async
```

Controllers depend on the store and the compiled schema, never on each other.
`FormRuntime` is the only place that wires them together, which is what makes
its [lifecycle order](../runtime/form-lifecycle.md) a stable contract.
Adapters (`react`, `rhf`, `angular`, …) depend on Core; Core never imports an
adapter. `pnpm check:boundaries` enforces this and rejects DOM-only globals in
Core source.

## Data flow of one mutation

```text
runtime.setValue(path, value)
  → plugin interceptors (may transform or cancel)
  → store mutation inside an implicit transaction
  → dependency resets → condition evaluation + hidden-value policies
  → events drained until the state settles
  → one subscriber notification with the final snapshot
  → data-source refreshes start on the next microtask (cancellable)
```

Validation is never implicit: it runs when `validate()` or `submit()` is called.

## Design rules

- **Immutable snapshots.** Every state object is deep-frozen; updates copy only
  the changed path.
- **One canonical path per field.** `items[0].name` and `items.0.name` address
  the same value and the same dirty, touched, and error state.
- **Compiled schemas.** `FormRuntime` validates, normalizes, and freezes the
  schema once; controllers read indexed lookups instead of walking the tree.
- **Stale-safe async.** Every async operation has a request generation and an
  `AbortSignal`; older results can never overwrite newer state.
- **Explicit ownership.** Whoever constructs a controller disposes it.
  `FormRuntime.dispose()` disposes everything it created.

## Stability

Public exports are classified as stable or experimental in
`packages/core/api-report.json`, and CI fails when the declared API changes
without an update to that report. See [API reference](../api/index.md) for the
versioning and deprecation policy.
