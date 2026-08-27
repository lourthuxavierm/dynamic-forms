# Conditions, dependencies, and data sources

## Conditions

Fields support `visibleWhen`, `disabledWhen`, `requiredWhen`, and `readOnlyWhen`. Conditions use `equals`, `notEquals`, existence, containment, and numeric comparison operators, with nested `and`, `or`, and `not` groups. `ConditionController` subscribes only to referenced paths. Hidden values follow `preserve` (default), `clear`, or `reset` policy.

```ts verify
import type { FormSchema } from '@dynamic-forms/core';
export const schema: FormSchema = { id: 'company', fields: [
  { name: 'accountType', type: 'select' },
  { name: 'companyName', type: 'text', visibleWhen: { field: 'accountType', operator: 'equals', value: 'business' }, hiddenValuePolicy: 'clear' },
] };
```

## Dependencies

`dependsOn` declares upstream paths. `DependencyController` can reset a dependent value with `resetOnDependencyChange` and request a data-source refresh. Avoid dependency cycles; schema validation reports invalid references.

## Data-source example

```ts verify
import { DataSourceManager } from '@dynamic-forms/core';
const manager = new DataSourceManager();
const options = await manager.loadConfig('countries', { type: 'function', cache: true, load: async ({ signal }) => { signal?.throwIfAborted(); return [{ label: 'India', value: 'IN' }]; } }, { values: {} });
void options;
manager.clearCache();
```

## Data-source lifecycle

`DataSourceManager` supports static options, functions, and URL GET requests. URL parameters beginning with `$` resolve against form values. A new request cancels the previous internal request. Generation counters prevent an older completion from overwriting current state. Optional caching uses `cacheKey` or a key derived from values and query options; call `clearCache` when its lifetime ends. External `AbortSignal` ownership remains with the caller.

Errors remain in data-source state and are rethrown. Never place secrets in schema URLs or query parameters.
