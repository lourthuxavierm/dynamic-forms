---
description: Run the repo's verification pipeline, scoped to changed packages when possible
---

Verify the current changes in this monorepo.

1. Run `git status` and `git diff --stat` to see which workspaces under `packages/` and `apps/` changed.
2. Always run `pnpm check:boundaries` and `pnpm lint`.
3. For each changed workspace, run its build (with `...` so dependencies build first), `typecheck`, and `test` via `pnpm --filter <package-name>`.
4. If `$ARGUMENTS` is `full`, or root config / shared tooling changed, run `pnpm verify` instead of steps 2–3.
5. If public API or docs changed, also run `pnpm docs:api:check` and `pnpm docs:governance`.

Report pass/fail per step. For failures, show the relevant error lines and propose a fix; don't paper over failures by weakening tests or lint rules.
