# Form Builder UI — Phase-wise Implementation Plan

## Objective

Evolve `apps/form-builder` into a production-ready visual builder matching the supplied reference while preserving its existing catalogue, drag/drop, nesting, inspector, validation, logic, data sources, history, JSON workflows, drafts, preview, and tests.

## Architecture rule

Keep data and presentation separate. `FormSchema` describes data and behaviour; a typed builder document describes steps, sections, columns, placements, and spans. Visual sections are not object fields. Old schemas receive a default single-page, single-column layout.

## Phase 0 — Baseline and extraction

- Expand tests for field operations, inspector edits, history, logic, JSON, persistence, preview, responsive behaviour, and accessibility.
- Capture desktop, tablet, and mobile baselines.
- Split `App.tsx` into shell, toolbar, palette, canvas, inspector, preview, JSON, and rules components without behavioural changes.

**Done:** Existing workflows remain compatible; tests, typecheck, and build pass.

## Phase 1 — Application shell

- Add the dark top bar: identity, breadcrumb, form ID, version, issue count, undo/redo, Preview, Import, Export, Save/Publish, settings, help, and profile.
- Add the dark rail: Builder, Playground, Templates, Data Sources, Validators, Conditions, and Settings.
- Preserve local drafts as Save; keep Publish disabled/local-only until Phase 8.

**Done:** The shell matches the reference, actions work, and controls have accessible focus and naming.

## Phase 2 — Design system and responsive workspace

- Define colour, typography, spacing, control, border, radius, shadow, focus, width, and breakpoint tokens.
- Build shared buttons, badges, tabs, inputs, switches, accordions, tooltips, and panel headers.
- Implement `Navigation | Palette | Canvas | Inspector`.
- Collapse navigation at medium widths; use inspector and palette drawers on smaller screens.

**Done:** Desktop, tablet, and mobile layouts are consistent, WCAG-aware, and free of unintended overflow.

## Phase 3 — Searchable field palette

- Add Add Fields heading, search, grid/list modes, and collapsible categories.
- Group fields under Basic Inputs, Selection, Date & Time, Advanced, Structure, and Layout & Utilities.
- Assign icons/colours and preserve specialized existing controls.
- Support click, drag, keyboard insertion, empty results, and incompatible destinations.

**Done:** Every registered field is searchable and addable without requiring drag/drop.

## Phase 4 — WYSIWYG canvas and layout

- Add form header, field/issue badges, Design/Preview/JSON/Rules tabs, and viewport controls.
- Add section cards with title, description, columns, collapse, reorder, duplicate, delete, and drop zones.
- Render realistic field previews with handles, markers, actions, selection, and error states.
- Support 1–4 columns, field spans, precise insertion, cross-section movement, keyboard movement, persistence, and undo/redo.

**Done:** The starter form can match the reference''s two-column layout, survives reload, and layout changes do not rename data paths.

## Phase 5 — Tabbed inspector

- **Properties:** type, label, name, placeholder, description, typed default, required, read only, disabled.
- **Validation:** numeric, text, item, pattern, type-specific constraints, and custom messages.
- **Logic:** visibility, disabled/required/read-only conditions, dependencies, reset, and hidden-value policy.
- **Appearance:** span, label/help position, density, and type-specific presentation.
- Retain Options, Data Source, and Advanced; validate names, preserve selection after rename, warn on destructive type changes, and show field issues.

**Done:** Every current inspector capability remains available and keyboard accessible.

## Phase 6 — Multi-step forms

- Add single-page/wizard modes and step create, rename, duplicate, reorder, and safe delete.
- Configure title, description, optional state, icon, and validation policy.
- Render active, complete, invalid, and optional states.
- Add Previous/Next, step validation, first-error focus, preserved values, review steps, and cross-step movement.

**Done:** A three-step reference-style form can be built without JSON and works identically in Design and Preview.

## Phase 7 — Rules and issue workflow

- Add a Rules view with filters, readable summaries, editing, and jump-to-field actions.
- Detect missing references and circular dependencies.
- Keep issue counts consistent across shell, canvas, Rules, and JSON.
- Add warning banner/details panel; issue selection opens, expands, selects, and scrolls to the affected field.
- Block preview/publish only for blocking errors.

**Done:** Every issue navigates to an actionable location and rule graph errors are found before publish.

## Phase 8 — Persistence and publishing

- Local: multiple drafts, list/search, duplicate/archive, autosave status, snapshots, restore, import/export, and migrations.
- Backend: forms, drafts, immutable releases, templates, ownership, permissions, submissions, and audit history.
- Lifecycle: `Draft -> Validated -> Published -> Archived`.
- Publish validates schema/layout, creates an immutable version and URL/ID, retains later edits as a draft, and supports rollback.

**Done:** Save and Publish are distinct, releases are immutable, migrations are tested, and failures are reported.

## Phase 9 — Accessibility and production hardening

- Ensure keyboard operation, focus, announcements, drag/drop alternatives, semantics, AA contrast, zoom, touch, and reduced motion.
- Add unit, component, Playwright, accessibility, visual regression, and migration tests.
- Benchmark 100, 500, and 1,000 fields and avoid canvas-wide rerenders during inspector input.
- Recover from corrupt drafts, preserve unknown types, and verify Chromium, Firefox, and WebKit.

**Done:** No critical accessibility issues remain, viewports do not overflow, and performance budgets pass.

## Release plan

| Release | Phases | Outcome |
| --- | --- | --- |
| 1 | 0–3 | Modular app, shell, design system, responsive workspace, palette |
| 2 | 4 | WYSIWYG canvas, sections, columns, spans, drag/drop |
| 3 | 5–7 | Inspector, wizard, Rules, issue navigation |
| 4 | 8 | Multi-form storage, versions, publish, rollback |
| 5 | 9 | Accessibility, regression, performance, recovery |

## Existing touchpoints

- `apps/form-builder/src/App.tsx`
- `apps/form-builder/src/styles.css`
- `apps/form-builder/src/builder/reducer.ts`
- `apps/form-builder/src/schema/catalogue.ts`
- `apps/form-builder/src/schema/operations.ts`
- `apps/form-builder/src/schema/builderValidation.ts`
- `apps/form-builder/src/persistence/draft.ts`
- `apps/form-builder/tests/builder.spec.ts`
- `packages/core/src/schema/types.ts`

## Definition of done

For every phase: acceptance criteria are met; tests, typecheck, build, and relevant Playwright suites pass; accessibility is reviewed; schema compatibility is preserved or migrated; mutations support undo/redo; responsive behaviour is verified; and user-facing changes are documented.


## Phase 0 completion record

Completed on 2026-09-05.

- Extracted the field palette, canvas field nodes, property inspector, and supporting editors into `apps/form-builder/src/builder/BuilderParts.tsx`.
- Extracted the runtime preview into `apps/form-builder/src/preview/Preview.tsx`.
- Reduced `App.tsx` to application state, commands, and view composition.
- Added keyboard mutation, accessibility landmark, conditional-logic, and data-source persistence workflows.
- Added committed Chromium visual baselines for desktop (1536×1024), tablet (900×1024), and mobile (390×844).
- Verification: typecheck passed; 9 unit tests passed; production build passed; 10 Playwright tests passed.

## Phase 1 completion record

Completed on 2026-09-06.

- Added `apps/form-builder/src/app/Shell.tsx` with the reference-style top bar and primary navigation rail.
- Wired form ID/version, schema status, undo/redo, new form, import, export, clipboard copy, and local save state into the shell.
- Kept Save & Publish explicitly disabled pending Phase 8 persistence.
- Added non-destructive feedback for future navigation destinations.
- Added compact desktop and mobile navigation/header behaviours with accessible control names.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 9 unit tests passed; production build passed; 11 Playwright tests passed.
