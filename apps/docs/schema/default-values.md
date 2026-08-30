# Default values

- Status: Documented
- Owner: Core and integration maintainers
- Last verified: 2026-08-26
- Applies to: Core, React, and React HTML 0.1.0

Core stores values independently of schemas. `FieldSchema.defaultValue` records
schema intent, while `FormStore` receives a complete initial value object from
the integration or application.

## Recommended initialization

```tsx verify
import type { FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';

const schema: FormSchema = {
  id: 'defaults',
  fields: [
    { name: 'name', type: 'text', defaultValue: '' },
    { name: 'active', type: 'checkbox', defaultValue: false },
  ],
};

export function DefaultsExample({ children }: { children: React.ReactNode }) {
  return (
    <FormProvider schema={schema} defaultValues={{ name: '', active: false }}>
      {children}
    </FormProvider>
  );
}
```

Provide explicit initial values at the integration boundary. Do not assume every
custom integration automatically derives its store from `defaultValue`.

## Reset behavior

`FormStore` clones initial values. `reset()` restores them and clears errors,
touched, and dirty state unless retention options are supplied. `resetField`
restores one path. Values must be compatible with `structuredClone`; functions,
DOM nodes, and several host objects are unsuitable as ordinary form values.

## Value guidance

- Empty text commonly uses `''`.
- Empty optional numeric controls may use `undefined` or the renderer's defined
  empty contract.
- Checkboxes and switches use booleans.
- Multi-value controls use arrays.
- Objects and arrays should start with their complete expected shape where
  practical.
- File values are runtime objects and are not JSON-serializable.
