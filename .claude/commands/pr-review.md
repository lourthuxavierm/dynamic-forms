---
description: Review the current branch against the repo's contribution rules before opening a PR
---

Review the changes on this branch versus the default branch (`git diff origin/main...HEAD`, falling back to the working tree diff).

Check against `CLAUDE.md`, `CONTRIBUTING.md` and `.github/pull_request_template.md`:

- Package boundaries respected (core stays framework/DOM-free; no cross-app or `src/`/`dist/` imports).
- Bug fixes include a regression test; new behavior has tests; renderer changes have accessibility coverage.
- Public API / schema / control behavior changes are reflected in `apps/docs` and the generated API reference.
- No unrelated formatting, hand-edited generated files, or unjustified lockfile changes.
- Backward compatibility preserved, or the breaking change is called out with migration notes.

Output: a short list of blocking issues, then non-blocking suggestions, then a draft PR summary filling in the "Change impact" checklist.
