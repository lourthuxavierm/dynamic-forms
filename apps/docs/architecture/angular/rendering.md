# Angular lazy controls, errors, and focus

- Status: Proposed
- Owner: Future Angular HTML and accessibility maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 architecture

Registry entries may provide an eager component or typed dynamic-import loader.
The renderer owns loading UI, retry, errors, injector scope, and cleanup while
Core remains unaware of chunking.

Unknown types and load/render failures must report field path and type without
exposing submitted values. Invalid submission provides an accessible summary
and configurable first-invalid focus. When a focused conditional field is
removed, focus moves predictably to a logical neighbor or form summary. Custom
controls register their focus target through a typed internal contract.
