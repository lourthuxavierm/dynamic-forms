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

## Phase 2 completion record

Completed on 2026-09-06.

- Added centralized design tokens in `apps/form-builder/src/styles/tokens.css`.
- Added typed Button, IconButton, Badge, Tabs, Switch, and PanelHeader primitives in `apps/form-builder/src/ui/Primitives.tsx`.
- Migrated the application shell buttons/status and builder view tabs to shared primitives.
- Added token-driven canvas, control, selection, and responsive workspace styling.
- Kept the palette, canvas, and inspector in three columns through 901px; stacked the inspector below that breakpoint and retained the mobile layout.
- Added primitive unit tests and responsive browser assertions.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 12 unit tests passed; production build passed; 12 Playwright tests passed.

## Phase 3 completion record

Completed on 2026-09-06.

- Extracted the field library into `apps/form-builder/src/builder/palette/FieldPalette.tsx`.
- Reorganized all existing field types into Basic Inputs, Selection, Date & Time, Advanced, Structure, and Layout & Utilities.
- Added searchable labels/types/categories, field icons, and category accent colours.
- Added persistent collapsible-category and grid/list preferences.
- Added keyboard/click insertion, drag-copy metadata, empty search feedback, clear search, and a Phase 4 layout-controls placeholder.
- Added catalogue unit tests and browser coverage for search and preference persistence.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 15 unit tests passed; production build passed; 13 Playwright tests passed.

## Phase 4 completion record

Completed on 2026-09-06.

- Added a typed builder-owned layout model with backward-compatible defaults and schema normalization in `apps/form-builder/src/builder/layout.ts`.
- Added immutable section, placement, column-span, section removal/relocation, and layout history operations.
- Added a persisted WYSIWYG canvas in `apps/form-builder/src/builder/canvas/FormCanvas.tsx`.
- Added editable sections, 1–4 column grids, field spans, cross-section placement, add/delete section controls, and layout undo/redo.
- Added realistic field previews, selected states, section drop zones, responsive desktop/tablet/mobile canvas modes, and fullscreen support.
- Preserved nested-field keyboard selection and all existing schema mutation workflows.
- Added layout unit tests and browser coverage for persistence, field spans, section movement, history, and viewport switching.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 18 unit tests passed; production build passed; 15 Playwright tests passed.

## Phase 5 completion record

Completed on 2026-09-06.

- Extracted a dedicated tabbed field inspector into `apps/form-builder/src/builder/inspector/FieldInspector.tsx`.
- Added Properties, Validation, Logic, and Appearance tabs with controls tailored to each field type.
- Added typed default values, validation constraints and messages, conditional visibility/state rules, dependencies, data-source configuration, option editing, and structural controls.
- Added appearance metadata for label/help placement, input density, and custom CSS classes.
- Added confirmation before destructive type changes and preserved advanced JSON editing for metadata and type configuration.
- Made field patches atomic in the builder reducer so rapid inspector edits cannot overwrite one another.
- Restored the saved selected field with drafts so the inspector resumes on the correct field after reload.
- Added browser coverage for typed defaults, validation, logic, data sources, appearance, and persistence.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 18 unit tests passed; production build passed; 16 Playwright tests passed.
## Phase 6 completion record

Completed on 2026-09-06.

- Added backward-compatible single-page and wizard configuration embedded in the serialized form schema.
- Added visual step creation, rename, duplication, reordering, safe deletion, and cross-step field assignment.
- Added step title, description, icon, optional/review flags, and validation-policy controls.
- Filtered the Design canvas by the active step while preserving the existing field and layout workflows.
- Added Preview step progress with active, complete, invalid, and optional states.
- Added Previous/Next navigation, per-step validation with invalid focus, preserved values, final submission, reset, and review-step summaries.
- Added wizard model unit coverage and a browser acceptance flow that builds and runs a three-step form without JSON.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 19 unit tests passed; production build passed; 17 Playwright tests passed.
## Phase 7 completion record

Completed on 2026-09-06.

- Added a dedicated Rules view with all/condition/dependency filters and readable rule summaries.
- Added issue cards and rule actions that return to Design with the affected field selected and its inspector available.
- Added missing-reference reporting through the shared schema validator and circular dependency graph detection.
- Kept the shell, canvas, Rules view, JSON validation, and Preview gate driven by the same issue collection.
- Kept Preview blocked only when the shared validator reports blocking schema errors.
- Added rule graph unit tests and browser coverage for filters and issue-to-field navigation.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 20 unit tests passed; production build passed; 18 Playwright tests passed.
## Phase 8 completion record

Completed on 2026-09-06.

- Replaced single-draft storage with a versioned local repository supporting multiple forms, activation, search, duplication, archive, autosave, and legacy migration.
- Added explicit Save and Publish actions with blocking validation and user-visible success/failure feedback.
- Added snapshots and restore, immutable releases with stable IDs/URLs, retained editable drafts, and release rollback into a new draft state.
- Added the `Draft -> Validated -> Published -> Archived` lifecycle model plus ownership, permissions, submissions, and audit-history entities behind a replaceable persistence boundary.
- Included persisted canvas layout in published releases and kept import/export compatibility through the form schema.
- Added a responsive Forms & Versions panel for forms, snapshots, releases, rollback, and audit history.
- Added migration and release-immutability unit tests plus browser coverage for save, publish, snapshot, and version management.
- Updated desktop, tablet, and mobile visual baselines.
- Verification: typecheck passed; 22 unit tests passed; production build passed; 19 Playwright tests passed.
