# React SSR and lifecycle

- Status: Implemented and integration-tested
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: React 18 or 19

Provider and subscription hooks supply server snapshots to
`useSyncExternalStore`, and the integration test renders a provider plus watched
value through `react-dom/server`. Browser focus logic is guarded when `document`
is unavailable.

The adapter does not claim streaming, server-component, or persisted-store
hydration semantics beyond those tests. Keep initial schema and values
deterministic between server and client. Effects create condition and dependency
controllers on the client and dispose them during cleanup; subscriptions must
also survive React Strict Mode's development remount cycle.
