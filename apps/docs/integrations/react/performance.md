# React performance

- Status: Verified subscription behavior
- Owner: React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/react` 1.0.0-rc (React 18 and 19)

Each field hook (`useField`, `useFieldState`, and `DynamicField`, which uses
`useField`) holds one subscription covering its store path (including ancestor
and descendant changes), its Core condition state, and its validation-progress
flag, and returns the same snapshot object until one of those changes.

Verified with a 500-field form in `packages/react/src/quality-gates.test.tsx`:

- changing one field re-renders only that field;
- validating one field re-renders only that field, before and after the result;
- a form-wide `reset()` renders each field at most once.

`useFormState(selector, equality?)` caches its selection. Inline selectors are
fine; selectors that build objects need an equality function such as the
exported `shallowEqual`. `DynamicField` also subscribes to one boolean for the
form-level disabled/submitting lock, so toggling it re-renders fields once.

Prefer field-scoped hooks over full-state subscriptions (`useFormState()` with
no selector, `useFormStore`). Renderer bundle and large-form guidance belongs
to [React HTML performance](../react-html/performance.md).
