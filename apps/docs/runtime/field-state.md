# Field state

- Status: Documented
- Owner: Core and React maintainers
- Last verified: 2026-08-26
- Applies to: Core and React 0.1.0

`useFieldState(path)` combines path-specific store state with conditional state.

## Returned state

- `error`
- `touched`
- `dirty`
- `isValidating`
- `visible`
- `disabled`
- `required`
- `readOnly`

```tsx verify
import { useFieldState } from '@lourthuxavierm/dynamic-forms-react';

export function EmailState() {
  const state = useFieldState('email');
  if (!state.visible) return null;
  return <span>{state.error ?? (state.dirty ? 'Edited' : 'Unchanged')}</span>;
}
```

The hook subscribes to the field path and that field's condition version. Nested
updates notify exact and parent paths. Condition state defaults to visible,
enabled, optional, and editable when no controller state exists.

Dirty state is removed when the field returns to its initial value. Touched and
dirty are independent; programmatic updates touch only when requested.
