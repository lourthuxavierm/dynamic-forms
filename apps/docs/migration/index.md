# Migration guides

- Status: Maintained for published breaking changes
- Owner: Package owners
- Last verified: 2026-08-28

Choose the boundary that is changing:

- [Schema versions](./schema-versions)
- [HTML compatibility to React HTML](./html-to-react-html)
- [React major versions](./react-major-versions)
- [Angular major versions](./angular-major-versions)
- [Dynamic Forms package major versions](./package-major-versions)
- [Adopting the Zod adapter](./zod-adapter)

## Safe migration sequence

1. Inventory current package, framework, schema, and persisted-value versions.
2. Read every intervening release note and migration guide.
3. Add contract tests around schemas, emitted values, validation, and events.
4. Upgrade one boundary at a time in a branch or canary environment.
5. Run package tests, examples, accessibility checks, and SSR tests.
6. Define stop conditions and verify rollback data compatibility.
7. Roll out gradually and compare errors, latency, and submission outcomes.

Never infer compatibility from installation success alone.
