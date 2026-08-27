# Documentation change-impact policy

- Status: Active
- Owner: Documentation maintainers
- Last verified: 2026-08-28

The governance verifier compares a pull request with its base commit and requires
companion artifacts for high-signal source boundaries.

## Required companions

| Source change | Required in the same pull request |
| --- | --- |
| Public package entry point or manifest | Generated API or canonical package/integration documentation |
| Core schema implementation | Schema reference |
| Renderer component, registry, entry, or rendering logic | Control, integration, or compatibility documentation |
| Example or playground source | Unit, integration, or browser test |
| Added `BREAKING CHANGE` or conventional `!:` marker | Migration guide |

These checks intentionally target strong repository signals. Reviewers still
evaluate behavioral changes that a path rule cannot infer.

## Feature definition of done

- A new control includes implementation, tests, control reference, compatibility,
  accessibility behavior, and a runnable example.
- New schema configuration includes types, runtime behavior, serialization rules,
  schema documentation, and tests.
- Renderer differences update every affected compatibility matrix.
- Public API removal is deprecated first when policy requires it and names a
  replacement and migration.
- New examples are reproducible and tested; screenshots are generated states.

## Running against a branch

```sh
DOCS_BASE_SHA=<base-commit> pnpm docs:governance
```

On PowerShell, set `$env:DOCS_BASE_SHA` before running the command. CI obtains
the pull-request base SHA from GitHub.
