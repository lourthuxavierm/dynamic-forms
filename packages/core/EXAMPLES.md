# Core schema examples

All persisted examples use `schemaVersion: 1`. Use `defineFormSchema` for strict authoring and `definePortableFormSchema` when the result must survive JSON serialization.

## Simple and validated fields

```ts
const profile = defineFormSchema({
  schemaVersion: 1,
  id: 'profile',
  fields: [
    { name: 'name', type: 'text', validation: { required: true, minLength: 2 } },
    { name: 'age', type: 'integer', validation: { min: 18 } },
  ],
} as const);
```

## Nested objects and arrays

```ts
const order = defineFormSchema({
  schemaVersion: 1,
  id: 'order',
  fields: [
    { name: 'customer', type: 'object', fields: [
      { name: 'email', type: 'email' },
    ] },
    { name: 'lines', type: 'array', fields: [
      { name: 'sku', type: 'text' },
      { name: 'quantity', type: 'integer', defaultValue: 1 },
    ] },
  ],
} as const);
```

## Conditions and dependent datasource

```ts
const location = defineFormSchema({
  schemaVersion: 1,
  id: 'location',
  fields: [
    { name: 'country', type: 'select', options: [{ label: 'India', value: 'IN' }] },
    {
      name: 'state',
      type: 'select',
      visibleWhen: { field: 'country', operator: 'equals', value: 'IN' },
      dependsOn: ['country'],
      dataSource: {
        type: 'url',
        url: '/states',
        params: { country: { fromField: 'country' } },
        searchParam: 'query',
        pageParam: 'page',
        pageSizeParam: 'pageSize',
      },
    },
  ],
} as const);
```

## Portable JSON

```ts
const portable = definePortableFormSchema({
  schemaVersion: 1,
  id: 'portable',
  fields: [{
    name: 'priority',
    type: 'select',
    options: [{ label: 'High', value: 'high', metadata: { color: 'red' } }],
    extensions: { 'my-company': { auditCode: 'PRIORITY' } },
  }],
} as const);
const restored = JSON.parse(JSON.stringify(portable));
```

## Inferred runtime values

```ts
type OrderValues = InferFormValues<typeof order>;
const runtime = createFormRuntime(order, {
  customer: { email: 'ada@example.com' },
  lines: [{ sku: 'ABC', quantity: 2 }],
});
runtime.setValue('lines.0.quantity', 3);
```

## Async and cross-field validation

Execution stays outside the schema and uses the validator abstraction:

```ts
await runtime.validate(async (values) =>
  await isOrderAllowed(values) ? {} : { lines: 'This order cannot be submitted' },
);
```

## Programmatic custom controls

Custom control values use the broad programmatic boundary; portable persisted schemas should use built-in field types or an adapter-owned extension contract.

```ts
type CustomValues = { color: `#${string}` };
type ColorValue = FieldValue<'color', CustomValues>;
const color: ColorValue = '#336699';
```
