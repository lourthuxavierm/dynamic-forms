# Angular HTML SSR and hydration

- Status: Not yet certified
- Owner: Angular HTML maintainers
- Last verified: 2026-08-27
- Applies to: Future release gate

The current baseline uses deterministic IDs and avoids direct browser APIs in
its components, but only the zoneless browser build is exercised. Angular
server rendering, hydration, transfer cache, conditional markup, and mismatch
tests remain required before SSR support is advertised.
