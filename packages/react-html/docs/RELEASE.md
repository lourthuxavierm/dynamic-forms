# React HTML release process

`@dynamic-forms/react-html` is the canonical renderer. `@dynamic-forms/html` is its compatibility package and must ship at the same version.

## Automated verification

From the repository root, run:

```sh
pnpm verify:react-html-release
```

The command builds and packs both packages, verifies their published manifests and required files, rejects unresolved `workspace:` ranges or leaked source/tests/scripts, and removes its temporary tarballs.

## Publication order

1. Complete the tests, accessibility review, performance check, and documentation verification.
2. Set the same version in both package manifests and refresh `pnpm-lock.yaml`.
3. Run `pnpm verify:react-html-release`.
4. Publish `@dynamic-forms/react-html` first.
5. Publish `@dynamic-forms/html` second so its exact canonical dependency already exists.

Do not publish the compatibility package alone or allow its version to diverge from the canonical renderer.

## Compatibility retirement

Do not remove `@dynamic-forms/html` during v1. Retirement requires a later major release, advance release notes, a migration window, confirmation that repository consumers use only `@dynamic-forms/react-html`, and continued availability of `MIGRATION-FROM-HTML.md` in the final compatibility release.
