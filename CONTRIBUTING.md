# Contributing to Dynamic Forms

Thank you for helping improve Dynamic Forms. The repository is a pnpm and Turbo monorepo under active pre-1.0 development.

## Workspace layout

```text
packages/
  core/          framework-independent form runtime
  react/         React providers, hooks, and renderer contracts
  react-html/    React browser-native renderer
  html/          legacy compatibility forwarding package
  examples/      adapter-neutral schemas and fixtures
  zod/           planned adapter
  rhf/           planned adapter
  json-schema/   planned adapter
  devtools/      planned developer tools
apps/
  react-html-playground/ native React renderer demonstration
  docs/            VitePress documentation
```

## Development setup

```sh
pnpm install
pnpm check:boundaries
pnpm typecheck
pnpm test
pnpm build
```

Use the package-level scripts while iterating:

```sh
pnpm --filter @dynamic-form-engine/core test
pnpm --filter @dynamic-form-engine/react test
pnpm --filter @dynamic-form-engine/react-html test
pnpm --filter @dynamic-forms/react-html-playground dev
```

## Architecture rules

- Core has no framework, DOM, or renderer dependencies.
- React may depend on Core and owns lifecycle and subscriptions, not visual controls.
- React HTML may depend on Core and React and owns native controls, DOM accessibility, layouts, and static styles.
- The legacy HTML package may forward only to React HTML and must contain no renderer implementation.
- Examples depend only on Core and remain adapter-neutral.
- Applications must not import another application's internal source files.
- Run `pnpm check:boundaries` after changing dependencies or imports.

## Change requirements

- Add a regression test for every bug fix.
- Add unit or integration tests for new behavior.
- Update public documentation when exports, peer dependencies, schema types, renderer registries, or behavior contracts change.
- Preserve backward compatibility unless the change is explicitly documented as breaking.
- Avoid unrelated formatting or generated-file changes.
- Keep commits focused and use the affected workspace as the commit scope when practical.

## Pull request checklist

- [ ] Package boundaries pass.
- [ ] Type checking passes.
- [ ] Relevant tests pass.
- [ ] Production builds pass.
- [ ] Public API and behavior changes are documented.
- [ ] Accessibility behavior is tested for renderer changes.
- [ ] Performance-sensitive subscription changes have been profiled.

## Reporting issues

Include a minimal schema, initial values, package versions, runtime environment, expected behavior, actual behavior, and a reproduction when possible. Never include credentials, private form submissions, or production data.
