# Angular signals and RxJS

- Status: Proposed
- Owner: Future Angular maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 architecture

Signals are the primary synchronous template and component state surface. Each
signal is a readonly projection of Core; commands mutate Core, which then
publishes the next state.

RxJS is opt-in for event streams, asynchronous application integration, and
interop with existing Observable pipelines. Stream adapters must subscribe
lazily, preserve Core event ordering, share cleanup through Angular lifecycle,
and avoid replaying mutations into Core. A signal and Observable representing
the same value are two views of one Core state, never competing stores.
