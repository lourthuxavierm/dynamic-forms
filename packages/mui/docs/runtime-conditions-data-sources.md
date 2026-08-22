# Runtime conditions and data sources

## Runtime field state

`MuiFieldRenderer` consumes `useFieldState` and maps Core condition results into `visible`, `disabled`, `required`, and `readOnly` control props. Hidden fields are removed from the DOM and focus order.

Condition subscriptions are indexed by referenced field. A change only notifies fields whose condition expressions depend on the changed path. Nested paths are treated as related when a parent or child changes.

### Hidden values

`FieldSchema.hiddenValuePolicy` is explicit:

- `preserve` (default): keep the current value while hidden.
- `clear`: set the value to `undefined` when hidden.
- `reset`: restore the field's initial value when hidden.

Choose `clear` for values that must not be submitted while inactive. UI hiding is not an authorization boundary; servers must enforce permissions independently.

## Data-backed selection controls

`MuiSelect` and `MuiAsyncAutocomplete` automatically use `field.dataSource`. Both expose loading, empty, error, and retry states. Existing autocomplete values remain visible when absent from the current result page.

`useDataSource` provides:

- dependency-driven refresh through `dependsOn`;
- current form values in `DataSourceContext` for cascading parameters;
- debounced search (250 ms by default);
- request cancellation on replacement, disablement, hiding/unmount, and explicit cancel;
- generation guards in Core and React so stale responses cannot replace current results;
- current-data preservation while refreshing or reporting a retryable error;
- cache, page, and page-size primitives for later pagination UI.

Option results normalize primitives and `{ label, value, disabled, group, children }` objects. Invalid option objects are ignored rather than passed into MUI.

Applications should make loaders honor `context.signal`, avoid embedding secrets in URL parameters, and enforce authorization server-side. Cancellation reduces wasted work but does not guarantee a remote server stopped processing a request.
