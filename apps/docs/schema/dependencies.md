# Field dependencies

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-core` 0.1.0

Dependencies declare that one field reacts when one or more value paths change.
They are distinct from visibility conditions.

## Example

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const locationSchema: FormSchema = {
  id: 'location',
  fields: [
    { name: 'country', type: 'select' },
    {
      name: 'state',
      type: 'autocomplete',
      dependsOn: ['country'],
      resetOnDependencyChange: true,
      dataSource: { type: 'url', url: '/api/states', params: { country: '$country' } },
    },
  ],
};
```

## Runtime behavior

`DependencyController` watches referenced paths and computes transitive
dependents. When a dependency changes it can:

- reset the dependent field when `resetOnDependencyChange` is true;
- call the integration's data-source refresh callback when `dataSource` exists.

The controller does not itself fetch renderer options. Integrations decide how
refresh callbacks load and display results.

## Validation rules

Dependencies must reference known paths and cannot reference the same field
path. Indexed array references such as `items[0].country` are accepted when the
corresponding structural schema path exists. Cyclic dependency behavior should
be prevented by application governance even when individual references validate.
