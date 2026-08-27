# Angular SSR and hydration

- Status: Proposed
- Owner: Future Angular maintainers
- Last verified: 2026-08-27
- Applies to: Phase 9 architecture

Server markup must be deterministic from serializable schema, initial values,
registry, layout, locale, and direction. Browser-only work—focus, observers,
files, media, canvas, object URLs—starts after browser rendering and is guarded
from server execution.

Hydration tests must cover IDs and ARIA relationships, conditional fields,
structural arrays, lazy controls, validation state, and error summaries. A
documented transfer-cache policy must prevent accidental duplicate data-source
requests while retaining cancellation and stale-result guarantees.
