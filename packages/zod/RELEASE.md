# Zod adapter release process

Run this gate from the repository root before publishing:

```sh
pnpm verify:zod-release
```

The command checks boundaries, type safety, behavior tests, package builds,
declarations, ESM and CommonJS loading, generated API drift, Zod architecture
evidence, and the contents and metadata of the packed npm artifact. Temporary
tarballs are created outside the repository and removed automatically.

## Compatibility prerequisite

The `Zod compatibility` CI workflow must pass all four pinned cells before its
release-gate job runs: Zod 3.25.5, 3.25.76, 4.0.0, and 4.5.1. Do not publish
from a local result alone when that matrix is failing or incomplete.

## Publication sequence

1. Publish the matching `@lourthuxavierm/dynamic-forms-core` version first.
2. Set the Zod adapter version and update the lockfile.
3. Review generated API, compatibility, migration, and release notes.
4. Run `pnpm verify:zod-release` from a clean checkout.
5. Confirm the four compatibility cells and dependent release-gate job passed.
6. Publish `@lourthuxavierm/dynamic-forms-zod` with public access.

The packed manifest must contain the exact released Core dependency rather than
an unresolved `workspace:` protocol. Zod remains a peer dependency so an
application owns its selected supported version.

## Rollback and incident handling

Stop publication if package contents, declarations, module loading, API drift,
or any compatibility cell fails. If a published adapter must be withdrawn,
deprecate the affected npm version with a replacement recommendation; do not
delete a version that consumers may already have locked. The adapter is
validation-only and does not rewrite persisted form values, but applications
must still assess separately changed submission parsing before downgrading.
