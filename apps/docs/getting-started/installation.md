# Installation

## Requirements

| Dependency | Supported range |
| --- | --- |
| React | `^18.0.0 || ^19.0.0` |
| React DOM | `^18.0.0 || ^19.0.0` |

Use a TypeScript-capable React application. The examples use Vite, but the runtime packages do not require it.

::: warning Pre-release availability
The repository is version 0.1.0. If these packages are not published to your registry, consume them from this workspace or your organization's approved package feed.
:::

## Install the runtime

```sh
pnpm add @dynamic-form-engine/core @dynamic-form-engine/react @dynamic-form-engine/react-html react react-dom
```

The React HTML renderer has no third-party component-library peer dependency. Import `@dynamic-form-engine/react-html/styles.css` if you want the optional default styles.

## Verify the install

Your package manager should report one compatible React runtime and no unmet peer dependencies. Then continue to the [quick start](./quick-start.md).

## Common installation failures

- Invalid hook call errors usually mean multiple React copies were resolved. Inspect your dependency tree and deduplicate it.
- A package-not-found response means version 0.1.0 is unavailable in the configured registry; use the workspace or approved feed noted above.
