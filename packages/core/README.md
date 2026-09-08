# @dynamic-form-engine/core

Framework-independent form state and schema runtime for Dynamic Forms. The package has no React or renderer dependencies.

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
} from '@dynamic-form-engine/core';

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

## Type-safe values and extensions

`FieldValueMap` defines the value produced by every built-in field. Use `FieldValue<'number'>` for a built-in value or supply a custom map for an extension:

```ts
type CustomValues = { color: `#${string}` };
type ColorValue = FieldValue<'color', CustomValues>;

const registry = new FieldRegistry<Renderer, Metadata, 'text' | 'color'>();
```

`InferSchemaType<typeof schema>` preserves literal field names and derives nested object, array, scalar, selection, and boolean values. Dynamic runtime schemas remain supported: unknown custom controls resolve to `unknown`, requiring consumers to narrow their values instead of receiving an unsafe `any`.
## Typed paths

`Path<TValues>` lists valid dot and bracket paths, while `PathValue<TValues, TPath>` resolves the value at a path. `FormStore<TValues>` uses both types for `getValue`, `setValue`, `resetField`, field errors, touched state, and field subscriptions.

```ts
interface CustomerValues {
  age: number;
  address: { city: string };
  contacts: Array<{ name: string }>;
}

const store = new FormStore<CustomerValues>();
store.setValue('address.city', 'Chennai');
store.setValue('contacts[0].name', 'Xavier');
// store.setValue('age', 'wrong'); // TypeScript error
```

For a path that only exists at runtime, opt in explicitly with `dynamicPath(runtimeString)`. Stores declared as `FormStore<Record<string, unknown>>` continue to accept arbitrary string paths.
## Selector subscriptions

Use `subscribeSelector` to observe one derived state slice. The listener runs only when that selection changes; pass a third equality function for structural or domain-specific comparison.

```ts
const unsubscribe = store.subscribeSelector(
  state => state.values.customer?.name,
  (name, previousName) => console.log({ name, previousName }),
);
```

`subscribeToValue`, `subscribeToError`, `subscribeToTouched`, and `subscribeToDirty` provide typed shortcuts for common field slices. Existing `subscribe` and `subscribeToField` behavior remains compatible. `ConditionController.subscribeSelector` provides the same change-only behavior for derived condition state.