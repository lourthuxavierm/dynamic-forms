# React HTML SSR and hydration

- Status: Supported foundations; application verification required
- Owner: React and React HTML maintainers
- Last verified: 2026-08-27
- Applies to: React 18 or 19

React HTML builds on the adapter's server-safe subscriptions and renders native
markup through React. Keep schema, initial values, registry, layout, locale,
direction, and generated application content deterministic between server and
client to avoid hydration mismatches.

Browser-only controls and APIs—file objects, camera/media access, canvas-backed
signatures, focus, and object URLs—must be activated after hydration and tested
in the target SSR framework. The repository verifies adapter server rendering;
it does not claim compatibility with every React framework, streaming mode, or
React Server Component boundary.
