# React performance

- Status: Verified subscription behavior
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-form-engine/react` 0.1.0

Field hooks subscribe to their field, and `useWatch` subscribes to requested
paths. Phase 8 integration tests verify that changing one field does not rerender
an unrelated field. `useFormState` supports a selector, but selector identity
and returned-value stability remain application responsibilities.

Keep schemas, registries, callbacks, and selector functions stable. Prefer
field-scoped hooks over full-store subscriptions, and profile application
controls separately from Core store work. Renderer bundle and large-form
guidance belongs to [React HTML performance](../react-html/performance.md).
