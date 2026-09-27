# CLAUDE.md

Guidance for Claude when working in this repository.

## What this is

Dynamic Forms: a framework-independent, schema-driven form engine. pnpm 10 + Turbo monorepo, TypeScript 6, Node 22 (matches CI). Packages publish under `@dynamic-form-engine/*`; private workspaces use `@dynamic-forms/*`. Pre-1.0 (`1.0.0-rc.1`).

```
packages/
  core/          framework-independent runtime — NO framework/DOM deps
  react/         React providers, hooks, renderer contracts (no visual controls)
  react-html/    React native-HTML renderer: controls, a11y, layouts, styles
  html/          legacy forwarder to react-html only — no implementation here
  angular/       Angular signals/lifecycle adapter (ng-packagr)
  angular-html/  Angular native-HTML renderer (ng-packagr)
  zod/           Zod validation adapter
  rhf/           React Hook Form adapter
  json-schema/   JSON Schema adapter
  devtools/      developer tools
  examples/      adapter-neutral schemas/fixtures (depends on core only)
apps/
  docs/                    VitePress docs + doc verification scripts
  form-builder/            React form builder UI
  react-html-playground/   angular-html-playground/   rhf-playground/
scripts/                   boundary check + release verification scripts
```

## Commands

```sh
pnpm install --frozen-lockfile
pnpm check:boundaries        # after ANY dependency or import change
pnpm lint                    # zero warnings allowed
pnpm typecheck
pnpm test
pnpm build
pnpm verify                  # all of the above — what CI runs
```

Iterate on one package with filters (build deps first with `...`):

```sh
pnpm --filter @dynamic-form-engine/core test
pnpm --filter @dynamic-form-engine/react-html... build
pnpm --filter @dynamic-forms/react-html-playground dev
```

Other: `pnpm docs:verify`, `pnpm docs:governance`, `pnpm builder:e2e`, `pnpm rhf:e2e`, `pnpm verify:<core|rhf|zod>-release`.

## Architecture rules (enforced by `scripts/check-package-boundaries.mjs`)

- `core` depends on nothing internal and never imports a framework or the DOM.
- `react` → core. `react-html` → core, react. `rhf` → core, react. `zod`, `examples`, `json-schema` → core.
- `html` may only forward to `react-html`.
- Apps never import another app's source files.
- Import from package entry points (`@dynamic-form-engine/x`), never from another package's `src/` or `dist/`.

## Working rules

- Every bug fix gets a regression test; new behavior gets unit/integration tests (Vitest).
- Renderer changes need accessibility coverage.
- Public API, schema types, control behavior or peer-dep changes → update docs in `apps/docs` and regenerate the API reference (`pnpm docs:api`).
- Preserve backward compatibility unless the change is explicitly marked breaking.
- Keep diffs focused: no drive-by reformatting, no edits to generated files (`dist/`, `apps/docs/api/generated/`) by hand.
- Don't change `pnpm-lock.yaml` unless dependencies actually change.
- Commit scope = affected workspace, e.g. `fix(core): ...`, `feat(react-html): ...`.
- Before finishing a change, run at least `pnpm check:boundaries`, lint, and the affected packages' typecheck + tests.

## Reference

- `CONTRIBUTING.md` — contributor workflow and PR checklist
- `.github/pull_request_template.md` — change-impact checklist
- `docs/architecture/` — architecture decisions
- Root `*-plan.md` / `*-roadmap.md` files — module implementation plans
