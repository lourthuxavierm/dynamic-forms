# React installation

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: React 18 or 19

Install `@dynamic-form-engine/core` and `@dynamic-form-engine/react` alongside React and
ReactDOM. The package declares React and ReactDOM 18 or 19 as peers and depends
on Core. Its single public package entry is `@dynamic-form-engine/react`.

```sh
pnpm add @dynamic-form-engine/core @dynamic-form-engine/react react react-dom
```

This produces a headless integration. Add `@dynamic-form-engine/react-html` only when
using its browser-native control renderer.
