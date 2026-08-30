# Data sources

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-core` 0.1.0

Data sources describe static, function, or URL-backed option data. Rendering and
option mapping remain integration responsibilities.

## Static source

```ts verify
import type { DataSourceConfig, FieldOption } from '@lourthuxavierm/dynamic-forms-core';

export const departments: DataSourceConfig<FieldOption> = {
  type: 'static',
  options: [
    { label: 'Engineering', value: 'engineering' },
    { label: 'Operations', value: 'operations' },
  ],
  cache: true,
};
```

## Function source

`type: 'function'` requires `load`. The loader receives current values, an
optional field name, and an abort signal. Functions are runtime-only and cannot
be transported safely as JSON.

## URL source

`type: 'url'` requires a nonblank URL. Supported configuration includes GET or
POST method selection, params, search/page parameter names, cache settings, and
cache keys. The current URL loader sends method and query parameters; it does
not construct a POST body.

Parameter strings beginning with `$` resolve from current form values, for
example `{ country: '$address.country' }`.

## Manager behavior

`DataSourceManager` provides loading state, cancellation, stale-generation
protection, optional cache, custom fetch injection, and error normalization.
Applications must still enforce URL allowlists, authentication, response-shape
validation, retry policy, and sensitive-value controls.

## Serialization

Static and URL configurations can be JSON when their values are JSON-safe.
Function loaders must be registered by trusted application code. Never execute
loader source received from an untrusted schema service.
