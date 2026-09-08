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
## Transactions and batch updates

`store.batch()` groups sync or async mutations into one atomic observer cycle. State reads inside the callback see each mutation immediately, while events and subscribers are deferred until the outermost batch completes. Nested batches are safe, repeated field events are consolidated, and condition/dependency effects settle before the final notification.

```ts
store.batch(() => {
  store.setValue('country', 'IN');
  store.setValue('state', null);
  store.setValue('city', null);
});
```

To validate once, call `store.validate(...)` at the end of an async batch or immediately after a synchronous batch. A failed callback does not roll state back: completed mutations are committed and notified once before the error is rethrown. This keeps the v1 transaction contract small and deterministic without introducing partial rollback semantics.

## Asynchronous operations and cancellation

Core async work uses monotonic request IDs and last-write-wins state. Starting a request for an existing key aborts the previous signal; responses from code that does not honor cancellation are still marked stale and cannot replace current state or populate caches.

`DataSourceManager` applies this contract to registered sources, remote options, pagination, and rapid search. Each source receives `signal` and `requestId` in its context. `getState(name)` consistently exposes `status`, `loading`, `requestId`, `data`, and the current non-cancellation `error`. Use `cancel(name)` when a field becomes hidden and `unregister(name)` when it is removed; both invalidate active work. `clear()` cancels all active requests.

```ts
const sources = new DataSourceManager({
  onError: (error, name, requestId) => report(error, { name, requestId }),
});

const options = await sources.loadConfig(
  'customers',
  {
    type: 'function',
    load: async ({ signal }) => fetch('/customers', { signal }).then(response => response.json()),
  },
  { values: store.getValues() },
  { search: 'ada' },
);
```

Form validation follows the same rule. Validators receive an optional `{ signal, requestId }` context, while `FormState.validating` and `validationError` expose current status. A newer `validate()` call aborts and invalidates the older call; `cancelValidation()` and `reset()` cancel active validation. Dependency refresh callbacks receive the same context, cancel superseded refreshes per dependent field, and are cancelled by `cancelRefresh(field)` or `dispose()`.

`AsyncRequestManager` is exported for custom remote controls and future plugins. Cancellation errors are not reported as failures. Current non-cancellation failures are normalized to `Error` and routed through the relevant `onError`/`onAsyncError` hook. Operations that ignore their abort signal may still resolve to their original caller, but their result has `current: false` and is never committed by Core.
