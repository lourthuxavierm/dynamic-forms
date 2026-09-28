# React SSR and lifecycle

- Status: Implemented and integration-tested
- Owner: React maintainers
- Last verified: 2026-09-28
- Applies to: React 18 or 19

Provider and subscription hooks supply server snapshots to
`useSyncExternalStore`. Browser-only focus logic is guarded when `document` is
unavailable.

## Guarantees

- **Conditions apply on the server.** Before the provider's condition
  controller mounts, hooks derive `visible`, `disabled`, `required`, and
  `readOnly` directly from the schema and current values. A field hidden by
  `visibleWhen` is absent from server HTML and is never rendered on the first
  client render.
- **Hydration matches.** Rendering the same schema and values on the server and
  client hydrates without mismatch warnings; the controllers then mount and
  the form reacts to changes.
- **Strict Mode.** The development mount/unmount/remount cycle creates one
  active set of controllers and subscriptions, and unmounting releases every
  store subscription.

These are covered by `packages/react/src/quality-gates.test.tsx`
(`renderToString`, `hydrateRoot`, and Strict Mode with a subscription tracker).

## Limits

The adapter does not claim streaming, React Server Components, or persisted
store hydration semantics. Keep the schema and initial values deterministic
between server and client. Conditions on fields inside array items are not
evaluated per item, matching Core.
