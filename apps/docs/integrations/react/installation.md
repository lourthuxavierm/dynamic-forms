# React installation

- Status: Implemented
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: React 18 or 19

Install `@dynamic-forms/core` and `@dynamic-forms/react` alongside React and
ReactDOM. The package declares React and ReactDOM 18 or 19 as peers and depends
on Core. Its single public package entry is `@dynamic-forms/react`.

```sh
pnpm add @dynamic-forms/core @dynamic-forms/react react react-dom
```

This produces a headless integration. Add `@dynamic-forms/react-html` only when
using its browser-native control renderer.
