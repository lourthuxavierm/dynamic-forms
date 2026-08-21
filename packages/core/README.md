# @dynamic-forms/core

Framework-independent form state and schema runtime for Dynamic Forms. The package has no React, MUI, or renderer dependencies.

## Public API

- **Schema**: `FormSchema`, `FieldSchema`, `validateSchema`, and `InferSchemaType`.
- **State**: `FormStore` with immutable snapshots, nested paths, field subscriptions, validation, submission, and lifecycle events.
- **Validation**: `createFieldValidators`, `createFormValidator`, and `validateField`.
- **Conditions**: `evaluateCondition` and `ConditionController`.
- **Dependencies**: `DependencyGraph` and `DependencyController`.
- **Data sources**: `DataSourceManager` for static, function, and URL-backed sources.
- **Extensions**: `FieldRegistry` and `FormEventEmitter`.

## Example

```ts
import {
  ConditionController,
  createFormValidator,
  FormStore,
  type FormSchema,
} from '@dynamic-forms/core';

const schema: FormSchema = {
  id: 'account',
  fields: [
    { name: 'accountType', type: 'select' },
    {
      name: 'companyName',
      type: 'text',
      visibleWhen: { field: 'accountType', operator: 'equals', value: 'business' },
      validation: { required: true },
    },
  ],
};

const store = new FormStore({ accountType: 'personal', companyName: '' });
const conditions = new ConditionController(store, schema);

store.setValue('accountType', 'business');
await store.validate(createFormValidator(schema));

conditions.dispose();
```

## Events

Use `store.on(type, listener)` to observe `valueChange`, `fieldChange`, `validate`, `submit`, and `reset` events.

## Data sources

`DataSourceManager.loadConfig()` supports static options, async functions, and URL sources. URL parameters may reference form values with `$path` syntax, for example `{ country: '$country' }`.
