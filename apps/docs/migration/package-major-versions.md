# Migrating Dynamic Forms package majors

Upgrade related `@dynamic-forms/*` packages as one tested set unless a release
guide explicitly states that mixed majors are supported.

## Procedure

1. Capture current versions and lockfile.
2. Review generated API changes, deprecations, compatibility tables, and release notes.
3. Replace deprecated APIs before removing the old major where possible.
4. Verify schema parsing, normalized output, validation timing, event ordering,
   custom controls, SSR, and accessibility.
5. Rebuild representative backend schemas and replay sanitized submissions.
6. Canary the release with error and latency stop conditions.

## Rollback

Retain the previous lockfile and deployable artifact. Confirm that schemas and
persisted values written after upgrade remain readable before downgrading. If a
data contract changed, execute the documented reverse migration or forward fix.

See [release readiness](../support/release-readiness) for the publication gate.

## Core deprecations and stability

`@dynamic-form-engine/core` classifies every export as stable or experimental
(`@experimental`) and records them in `packages/core/api-report.json`. Stable
exports change incompatibly only in a major release, after a deprecation that
names a replacement and a removal version. Experimental exports, currently the
runtime diagnostics, performance budgets, and `CorePluginHost`, may change in a
minor release; pin a minor version if you depend on them.

| Deprecated | Replacement | Removal |
| --- | --- | --- |
| `InferSchemaType<typeof schema>` | `InferFormValues<typeof schema>` | 2.0.0 |

Replace deprecated APIs while still on the current major; the next major
removes them. The full policy ships with the package as
`@dynamic-form-engine/core/STABILITY.md`.
