# Plan: Stability Checklist Item 2 - FormStore

## Objective
Enhance the `FormStore` to reliably manage form state, support nested paths, and provide a full suite of operations as required by the Stability Checklist.

## Key Files & Context
- `packages/core/src/store/store.ts`: Main FormStore implementation.
- `packages/core/src/store/types.ts`: New file for store-related types.

## Implementation Steps

### 1. Enhance FormState
- Add `valid`, `disabled`, and `loading` to `FormState`.
- Support generic type for `values` to enable better TypeScript support.

### 2. Implement Missing Operations
- `getValues()`: Return the entire values object.
- `setValues(values, options)`: Update multiple values at once.
- `reset(initialValues?)`: Reset the form to initial or new values.
- `resetField(name)`: Reset a specific field to its initial value.
- `validate()`: Trigger form-wide validation (needs integration with validation system).
- `submit()`: Handle form submission state.

### 3. Support Nested and Array Paths
- Use a utility like `lodash-es` or implement surgical path helpers to get/set values in nested objects and arrays (e.g., `setValue('profile.name', 'John')`).
- Ensure `dirty` and `touched` tracking also works with nested paths.

### 4. Implement Fine-Grained Subscriptions
- Allow subscribing to specific fields or parts of the state (e.g., `store.subscribeToField('email', listener)`).
- Optimize `notify()` to only trigger relevant listeners.

### 5. Verification & Testing
- Create `packages/core/src/store/store.test.ts`.
- Test all operations.
- Test nested path updates.
- Test dirty/touched tracking for nested paths.
- Test subscription performance/granularity.

## Success Criteria
- [ ] `FormStore` implements all required operations from the checklist.
- [ ] Nested paths (e.g., `a.b[0].c`) are supported for all operations.
- [ ] Subscriptions are fine-grained (don't notify everyone on every change).
- [ ] All tests pass.
