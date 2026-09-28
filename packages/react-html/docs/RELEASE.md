# React HTML release process

`@dynamic-form-engine/react-html` is the canonical renderer. `@dynamic-form-engine/html` is its compatibility package and must ship at the same version.

## Automated verification

From the repository root, run:

```sh
pnpm verify:react-html-release
```

The command builds and packs both packages and checks:

- manifests: names, the shared version, the canonical dependency pin, public access, and no unresolved `workspace:` ranges;
- published files: every entry's ESM, CommonJS, and declaration file, the stylesheet and docs, with no source, scripts, tests, or test declarations;
- that every export-map target exists, and that every subpath loads in ESM and CommonJS with identical exports in both packages;
- that the canonical index matches `api-report.json` and each subpath only exports index symbols;
- that a consumer project type-checks imports of every export and every subpath of both packages under bundler, Node ESM (`nodenext`), and Node CommonJS resolution.

It runs in CI together with `pnpm --filter @dynamic-form-engine/react-html performance`.

## Publication order

1. Complete the tests, accessibility review, performance check, and documentation verification.
2. Set the same version in both package manifests and refresh `pnpm-lock.yaml`.
3. Run `pnpm verify:react-html-release`.
4. Publish `@dynamic-form-engine/react-html` first.
5. Publish `@dynamic-form-engine/html` second so its exact canonical dependency already exists.

Do not publish the compatibility package alone or allow its version to diverge from the canonical renderer.

## Compatibility retirement

Do not remove `@dynamic-form-engine/html` during v1. Retirement requires a later major release, advance release notes, a migration window, confirmation that repository consumers use only `@dynamic-form-engine/react-html`, and continued availability of `MIGRATION-FROM-HTML.md` in the final compatibility release.
