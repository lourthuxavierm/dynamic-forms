# @dynamic-forms/examples

Adapter-neutral schemas, initial values, fixtures, and business rules shared by
the native HTML playground and documentation. This package depends only on
`@dynamic-form-engine/core`; it must never contain React components or adapter imports.

Use focused subpath imports to keep examples independently loadable:

```ts
import { basicFormSchema, basicInitialValues } from '@dynamic-forms/examples/basic';
```
