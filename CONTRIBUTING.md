# Contributing to Dynamic UI Engine

We would love for you to contribute to Dynamic UI Engine and help make it better. As a contributor, here are the guidelines we would like you to follow:

- [Code of Conduct](#code-of-conduct)
- [Question or Problem?](#question)
- [Issues and Bugs](#issue)
- [Feature Requests](#feature)
- [Submission Guidelines](#submit)
- [Development Setup](#development)
- [Coding Rulesets](#rules)
- [Commit Message Guidelines](#commit)
- [Signing the CLA](#cla)

## <a name="code-of-conduct"></a> Code of Conduct

Help us keep Dynamic UI Engine open and inclusive. Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## <a name="question"></a> Got a Question or Problem?

Do not open issues for general support questions — we want to keep GitHub issues for bug reports and feature requests. Instead:

- Ask on [GitHub Discussions](../../discussions).
- Tag your question appropriately (`core`, `react`, `mui`, `devtools`, etc.) so it reaches the right maintainers.

## <a name="issue"></a> Found a Bug?

If you find a bug in the source code, you can help by [submitting an issue](#submit-issue) — or, even better, by [submitting a Pull Request](#submit-pr) with a fix.

## <a name="feature"></a> Missing a Feature?

You can *request* a new feature by [submitting an issue](#submit-issue).

If you would like to *implement* a new feature:

- **Small features** can be crafted and directly [submitted as a Pull Request](#submit-pr).
- **Large features** (a new package, a new renderer, a change to `@dynamic-ui/core`'s public API) should first be discussed via an RFC issue, so we can coordinate and avoid duplicated or wasted effort. Tag it `rfc`.

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, search the issue tracker — an issue for your problem might already exist.

When filing a bug, please include:

- Package and version affected (`@dynamic-ui/core@0.3.1`, etc.)
- A minimal reproduction — a StackBlitz/CodeSandbox link or a small repo is strongly preferred
- Expected vs. actual behavior
- Browser/Node/TypeScript version, if relevant

Unreproducible bugs, or bugs without enough information, may be closed and re-opened once details are provided.

### <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before submitting a PR:

1. Search existing PRs for one already addressing the issue.
2. Sign the [CLA](#cla) — required before we can merge any code contribution.
3. Fork the repo.
4. Create your branch from `main`:
   ```bash
   git checkout -b my-fix-branch main
   ```
5. Follow our [Coding Rulesets](#rules).
6. Add or update tests for any behavior you add or change. **PRs without tests for new logic will not be merged.**
7. Run the full check suite locally:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
8. Commit using our [commit message convention](#commit) — this is enforced by `commitlint` in CI and is required for our automated changelog and release process.
9. Push and open a PR against `main`.
10. If we suggest changes:
    - Make the requested updates.
    - Rebase and force-push to keep history clean:
      ```bash
      git rebase main -i
      git push -f
      ```

**PR requirements before merge:**

- All CI checks green (lint, typecheck, unit, e2e, bundle-size)
- No decrease in test coverage for touched packages
- `@dynamic-ui/core` changes: **zero new React or MUI imports**, enforced by a lint rule — this is non-negotiable given the project's architecture
- Public API changes: updated TSDoc and, for breaking changes, an entry under `BREAKING CHANGE:` in the commit footer
- At least one maintainer approval; two for changes to `packages/core`

That's it — thank you for your contribution!

#### After your PR is merged

Delete your branch and sync your fork:

```bash
git push origin --delete my-fix-branch
git checkout main -f
git branch -D my-fix-branch
git pull --ff origin main
```

## <a name="development"></a> Development Setup

This is a `pnpm` + `Turborepo` monorepo.

```bash
git clone https://github.com/<org>/dynamic-ui-engine.git
cd dynamic-ui-engine
pnpm install
pnpm build          # build all packages once
pnpm dev            # watch mode across packages
pnpm --filter docs dev       # run the docs app
pnpm --filter playground dev # run the playground app
```

### Repository layout

```
packages/
  core/            framework-free engine — no React, no MUI
  react/           React bindings
  react-hook-form/ optional RHF bridge
  mui/             MUI v9 renderer
  zod/             Zod validation adapter
  json-schema/     JSON Schema adapter
  devtools/        inspector
apps/
  docs/
  playground/
  builder/
examples/
```

### Useful commands

| Command | Purpose |
|---|---|
| `pnpm test` | Run unit tests (Vitest) across all packages |
| `pnpm test:e2e` | Run Playwright end-to-end suite |
| `pnpm test --filter @dynamic-ui/core` | Test a single package |
| `pnpm lint` | ESLint across the monorepo |
| `pnpm typecheck` | `tsc --noEmit` across all packages |
| `pnpm changeset` | Record a changeset for your PR (see below) |
| `pnpm storybook` | Run the MUI renderer's Storybook |

### Changesets

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. Every PR that changes package behavior must include a changeset:

```bash
pnpm changeset
```

Pick the affected package(s), the semver bump (`patch`/`minor`/`major`), and write a one-line summary — this becomes the changelog entry.

## <a name="rules"></a> Coding Rulesets

To ensure consistency and maintainability:

- **All source is TypeScript**, `strict: true`. No `any` without a `// eslint-disable-next-line` and a comment explaining why.
- **`packages/core` has zero runtime dependencies on React, MUI, or any UI framework.** This is enforced by CI (`pnpm lint:boundaries`) and is the single most important architectural rule in this repository.
- **Public APIs are documented with TSDoc.** Every exported function, type, and component needs a doc comment.
- **New field types, conditions, or data source types go through the Registry** — not through modifying core switch statements.
- **Every bug fix needs a regression test.** Every new feature needs unit tests at minimum; renderer-level features (`packages/mui`, `packages/react`) also need a Storybook story or Testing Library test.
- **No unnecessary re-renders.** Changes to `packages/react` or `packages/mui` that touch subscription logic must include a note in the PR description confirming you've checked render counts (React DevTools Profiler or our internal render-count test harness) for a large-form fixture.
- Format with Prettier (`pnpm format`) — this runs automatically on commit via `lint-staged`.

## <a name="commit"></a> Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, closely modeled on the Angular commit convention. This drives our automated changelog and semantic versioning, so it's enforced by `commitlint` in CI.

### Commit message format

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense, lowercase, no period at end
  │       │
  │       └─⫸ Commit Scope: core|react|mui|react-hook-form|zod|json-schema|devtools|docs|playground|repo
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

The **header** is mandatory and must not exceed 100 characters. A **body** and **footer** are optional but encouraged for anything non-trivial.

```
<type>(<scope>): <short summary>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Type

| Type | Used for |
|---|---|
| `build` | Build system or external dependencies (turborepo, tsup, pnpm) |
| `ci` | CI configuration and scripts |
| `docs` | Documentation only |
| `feat` | A new feature |
| `fix` | A bug fix |
| `perf` | A code change that improves performance |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |

### Scope

The scope should be the affected package name (without the `@dynamic-ui/` prefix), e.g. `core`, `react`, `mui`, `devtools`. Use `repo` for changes spanning the whole monorepo (tooling, root config).

### Summary

- Use the imperative, present tense: "add" not "added" or "adds"
- Don't capitalize the first letter
- No period at the end

### Body

- Use the imperative, present tense, same as the summary
- Explain the motivation for the change and contrast it with previous behavior

### Footer

The footer is where breaking changes and issue references go.

```
BREAKING CHANGE: <description of what broke and how to migrate>
Closes #1234
```

A commit that has a `BREAKING CHANGE:` footer triggers a **major** version bump for the affected package(s) in our release process, regardless of `type`.

### Examples

```
feat(core): add dependency graph cycle detection

Detects circular dependsOn references at schema-parse time and throws
a descriptive error instead of infinite-looping at runtime.

Closes #142
```

```
fix(react): prevent re-render of unaffected fields on condition change

useDynamicField now diffs the computed visible/disabled/required output
before triggering a state update, instead of re-rendering on every
upstream field change.

Closes #201
```

```
feat(mui): add NumberField renderer

BREAKING CHANGE: the `number` field type in the MUI renderer now maps
to MUI v9's native NumberField instead of a custom implementation.
Custom `numberFieldProps` passed via schema config should be reviewed
against NumberField's prop API.
```

## <a name="cla"></a> Signing the Contributor License Agreement (CLA)

Before we can accept your Pull Request, you (or your employer) must sign our CLA. This protects you as a contributor and protects the project — it's the same reason large open-source projects like Angular require one.

- If you're contributing as an individual, sign the **Individual CLA**.
- If you're contributing on behalf of a company, have an authorized signer sign the **Corporate CLA**.

Our CLA bot will comment on your first PR with a link to sign — you only need to do this once.

---

Thank you for helping build Dynamic UI Engine. 🎉