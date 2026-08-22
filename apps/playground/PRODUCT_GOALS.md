# Playground product-goal baseline

This document converts Section 1 of `ENTERPRISE_PLAYGROUND_ROADMAP.md` into measurable release criteria. The machine-readable source is `src/config/productGoals.ts`.

## Status rule

A goal is **verified** only when every acceptance criterion has reproducible evidence. A scaffold, isolated example, or planned page is evidence of progress, not completion.

## Current baseline

| Goal | Priority | Status | Current evidence | Primary gap |
| --- | --- | --- | --- | --- |
| Stable package and control coverage | P0 | In progress | Core/React/MUI complete-form and quickstart examples | Reachable catalogue for all 42 registered controls |
| Runtime inspection | P0 | In progress | Inspector component boundaries exist | Inspectors are currently empty |
| Runnable, editable, copyable demos | P0 | In progress | Docs and playground share the quickstart source | Safe editor and complete copy actions |
| Enterprise workflows | P0 | In progress | Enterprise schema scaffold | Production-quality end-to-end workflow |
| Desktop, tablet, and mobile | P0 | In progress | Responsive quickstart spacing | Responsive shell and multi-viewport tests |
| Shareable URLs and preferences | P1 | In progress | Quickstart query-string entry | Stable routing and safe preference persistence |
| Integration-test application | P1 | In progress | Chromium quickstart flow | Route, console, accessibility, and viewport suites |

## Governance

- Evidence must use public package exports.
- Panels must redact passwords, tokens, files, and fields configured as sensitive.
- Shared URLs and persisted preferences must never contain form values by default.
- Placeholder packages and unsupported schema types must not be presented as implemented.
- Changes to acceptance criteria require a roadmap review, not an incidental UI change.
