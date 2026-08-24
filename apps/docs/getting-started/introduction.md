# Introduction

Dynamic Forms separates portable form behavior from visual rendering:

- `@dynamic-forms/core` owns schemas, state, validation, conditions, dependencies, events, and data sources.
- `@dynamic-forms/react` connects the runtime to React lifecycle and subscriptions.
- `@dynamic-forms/html` renders accessible browser-native controls with an overridable registry and optional static CSS.

The packages are pre-1.0. Core, React, HTML, and Examples are implemented; consult the [package inventory](../documentation-inventory.md) before adopting other workspace packages.

## What you will build

In the quick start you will install the packages, define a schema, render native controls, validate input, show errors, and handle a valid submission.

Dynamic Forms is most valuable when schemas are reused, generated, conditional, or maintained separately from page layout. A small static form may be simpler with directly composed HTML controls.

## Next step

Continue with [Installation](./installation.md).
