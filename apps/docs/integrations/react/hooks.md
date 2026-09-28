# React hooks and subscriptions

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/react` 1.0.0-rc (React 18 and 19)

| API | Subscription or responsibility |
| --- | --- |
| `useForm` | Creates a stable typed store and registry |
| `useField` | Field value, error, touched/dirty, validation progress, Core condition state (`visible`, `disabled`, `required`, `readOnly`), and stable actions from one subscription |
| `useFieldState` | Field state and condition state without the value or actions |
| `useWatch` | One value or a list of values |
| `useFormState(selector, equality?)` | Selected form state; re-renders only when the selection changes (`Object.is` by default, or `shallowEqual`) |
| `useFormActions` | Mutations, validation, submit, and reset; one object for the life of the store |
| `useFormStore` | Full state for an explicitly supplied store |
| `useFormEvent` | Core event subscription with unmount cleanup; inline listeners do not resubscribe |
| `useDataSource` | Data, loading, errors, search, paging, refresh, and cancel; inline `config` objects are safe |
| `useFieldArray` | Stable array item operations |
| `useSection`, `useWizard` | Headless disclosure and step state |

Hooks use `useSyncExternalStore` where they subscribe to Core. Prefer the
narrowest hook or selector that supplies the required state; broad form-state
subscriptions rerender for more changes.

Field hooks resolve `items[0].name` and `items.0.name` to the same field state.

```tsx verify
import { shallowEqual, useFormState } from '@dynamic-form-engine/react';

export function SubmitBar() {
  const { valid, submitting } = useFormState(
    (state) => ({ valid: state.valid, submitting: state.submitting }),
    shallowEqual,
  );
  return <button type="submit" disabled={!valid || submitting}>Save</button>;
}
```
