# Structural rendering contracts

`@dynamic-forms/react-html` renders object and array schema fields recursively while keeping values and validation in the shared form store.

## Arrays

Object items use indexed paths such as `contacts[0].email`. Primitive items use the item path itself, such as `tags[0]`, and are enabled with `metadata: { primitiveItems: true }` or a single child named `$value`.

Array controls support add, remove, duplicate, and move operations. `validation.minItems` and `validation.maxItems` disable operations that would violate collection bounds. New object items are built from child defaults; duplicate performs a deep clone so rows never share mutable data.

Row keys are opaque and stable across value edits and adapter mutations. Consumers must not persist or submit these keys.

## Conditional item fields

Conditions on an array child can reference sibling values by name. For example, `visibleWhen: { field: 'kind', operator: 'equals', value: 'business' }` is evaluated against that row, with root form values also available for absolute dependencies.

## Large collections

Pass `arrayItemsRenderer` to `HtmlForm` to integrate a windowing library. The callback receives the structural field, its path, and ordered items containing stable IDs, indexes, and renderable content. The adapter does not prescribe a virtualization dependency.

The windowing implementation remains responsible for keyboard reachability, restoring focus after mutations, and ensuring invalid off-screen rows can be revealed.
