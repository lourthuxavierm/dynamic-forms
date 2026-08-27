# Angular package and runtime decisions

- Status: Proposed
- Owner: Core and future Angular maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 architecture

The proposed headless adapter and HTML renderer are separate packages so design
systems can consume Angular lifecycle without the default browser controls.
Package names remain provisional until manifests exist.

Core's `FormStore` remains authoritative. Angular projects Core state into
readonly framework state and forwards commands back to Core. Angular concepts
must not enter Core source, public types, tests, or dependencies.

Application defaults use environment providers; isolated form state uses a
component-level provider. Typed multi-providers contribute controls and layouts
with deterministic precedence and development diagnostics for collisions.
