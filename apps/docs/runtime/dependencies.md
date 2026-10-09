# Dependency processing

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc and React

Dependencies describe *reactions* to value changes: resetting a dependent
field and refreshing its data source. Visibility and enablement are
[conditions](./conditions.md), not dependencies.

```ts verify
import { FormRuntime, type FormSchema } from '@dynamic-form-engine/core';

const schema: FormSchema = {
  id: 'address',
  fields: [
    { name: 'country', type: 'select' },
    { name: 'state', type: 'select', dependsOn: ['country'], resetOnDependencyChange: true },
  ],
};

const runtime = new FormRuntime(schema, { country: 'IN', state: 'TN' });
runtime.setValue('state', 'KA');
runtime.setValue('country', 'US'); // state is reset to its initial value, 'TN'
runtime.dispose();
```

## Graph guarantees

- Cycles are rejected before any controller runs: schema normalization reports
  them as diagnostics (so `FormRuntime` construction throws
  `SchemaNormalizationError`), and `DependencyGraph` throws
  `Dependency cycle detected: a -> b -> a` for edges added directly.
- Transitive dependents are resolved depth-first in a deterministic, sorted
  order, and each dependent is processed once per change.

## When a dependency counts as changed

On every `valueChange`, a declared `dependsOn` path is considered changed when
the mutated path:

- is the dependency, in either array spelling (`items[0]` / `items.0`);
- is inside it (editing `items[0].code` changes a dependency on `items`); or
- replaced one of its ancestors **and** the value at the dependency's position
  differs (`setValue('profile', …)` changes `profile.address.country` only if
  the new country differs).

On `reset`, every declared dependency is treated as changed.

## Reactions

For each transitive dependent of a changed dependency:

1. `resetOnDependencyChange: true` restores the dependent's initial value and
   clears its field state (`resetField`).
2. A dependent with a `dataSource` is refreshed. Each dependent has its own
   request generation: a newer refresh aborts the older one, and only the
   current request can update state. `FormRuntime` starts the load on the next
   microtask, after subscribers have seen the settled state, and passes the
   abort signal to `DataSourceManager.loadConfig`.

Errors from current refreshes go to `DependencyControllerOptions.onAsyncError`;
aborted or superseded refreshes are silent. `cancelRefresh(field)` aborts one
dependent's refresh.

Resets run inside the mutation's transaction, so a chain of dependent resets
still produces one subscriber notification.

## Lifecycle

`dispose()` unsubscribes from the store and aborts active refreshes.
`FormRuntime` disposes the controller it creates.
