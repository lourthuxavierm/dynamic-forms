# Data-source runtime

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

`DataSourceManager` executes registered functions or static/function/URL schema
configurations. `useDataSource` connects that manager to provider values and
React lifecycle.

## Manager state

Each named source may expose:

- `data`
- `loading`
- `error`

The manager can register/unregister named functions, load configurations, cancel
a named run, clear cache, or clear all state.

## React hook

`useDataSource(fieldName, options)` resolves configuration from the schema or
hook options. It watches field dependencies, search, page, and page size;
debounces search; refreshes enabled sources; and cancels on cleanup.

```tsx verify
import { useDataSource } from '@lourthuxavierm/dynamic-forms-react';
import type { FieldOption } from '@lourthuxavierm/dynamic-forms-core';

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
