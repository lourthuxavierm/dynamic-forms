# Data-source runtime

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc and React

`DataSourceManager` executes registered functions or static/function/URL schema
configurations. `useDataSource` connects that manager to provider values and
React lifecycle.

## Manager contract

`DataSourceManager` loads named sources. `register(name, fn)` + `load(name,
context)` runs a registered function; `loadConfig(name, config, context,
options)` runs a schema `DataSourceConfig`:

| `type` | Behavior |
| --- | --- |
| `static` | Returns a copy of `options`. |
| `url` | Calls `fetch` (injectable through `DataSourceManagerOptions.fetch`) with `params`, `searchParam`, `pageParam`, and `pageSizeParam`. A string param starting with `$` reads a form value by path, with dot or bracket array segments (`$items[0].code`). Non-2xx responses throw. |
| `function` or omitted with `load` | Calls `load(context)`. |

`getState(name)` returns `{ data, loading, status, requestId, error? }`, where
`status` is `idle`, `loading`, `success`, `error`, or `cancelled`. While a
request is loading, `data` keeps the previous result.

## Concurrency and cancellation

- Starting a load for a name aborts that name's in-flight request.
- Every request has a monotonically increasing `requestId`. Only the current
  request may update state; a superseded response is discarded even if its
  loader ignored the abort signal.
- `cancel(name)` aborts the in-flight request and marks it `cancelled`.
  `unregister(name)` also forgets the registered function and its state; call
  `clearCache()` to drop cached results. `clear()` resets everything.
- Loaders receive `context.signal` and `context.requestId`. Cancellation is
  cooperative: pass the signal to `fetch` or check it in long-running work.
- Current, non-abort failures are reported once through
  `DataSourceManagerOptions.onError`. `onRequest` (experimental) observes every
  phase, including `stale` and `cache`; see [diagnostics](./diagnostics.md).

## Cache

With `cache: true`, successful **current** results are cached under
`cacheKey`, or by default under the source name plus the serialized values,
search, page, and page size. A cache hit cancels any in-flight request for the
name and returns immediately. `clearCache()` empties the cache. Superseded
responses are never cached. See [cache](./cache.md).

## React hook

`useDataSource(fieldName, options)` resolves configuration from the schema or
hook options. It watches field dependencies, search, page, and page size;
debounces search; refreshes enabled sources; and cancels on cleanup.

```tsx verify
import { useDataSource } from '@dynamic-form-engine/react';
import type { FieldOption } from '@dynamic-form-engine/core';

export function DepartmentStatus() {
  const source = useDataSource<FieldOption>('department', { debounceMs: 300 });
  if (source.loading) return <span>Loading departments…</span>;
  if (source.error) return <span>Departments unavailable.</span>;
  return <span>{source.data.length} departments available</span>;
}
```

## Error boundary

The manager normalizes thrown values to `Error` and rethrows. `useDataSource`
stores non-abort errors and resolves its refresh call with an empty array. The
UI must distinguish empty success from failure using `error`.

## Security

Validate response shapes, restrict URLs, apply authentication outside schemas,
and prevent sensitive form values from becoming uncontrolled query parameters.
