# Playground architecture

Section 2 establishes feature boundaries without claiming later roadmap features are complete.

- `app/` owns route metadata, navigation derivation, global providers, and failure containment.
- `Layout/` owns visual shell composition; Section 3 implements it.
- `pages/` owns route-level experiences and may depend on shared components and examples.
- `components/` owns reusable demo and inspector UI.
- `examples/` is canonical runnable source; documentation should import it instead of copying it.
- `hooks/`, `config/`, and `types/` contain cross-feature contracts.
- `mocks/` and `workers/` are deterministic backend and off-main-thread boundaries, implemented only when their roadmap sections begin.
- `styles/` contains playground-specific design tokens. Package components must remain playground-independent.

Route status is explicit: `available`, `scaffolded`, or `planned`. Navigation must not present scaffolded or planned routes as complete demonstrations.
