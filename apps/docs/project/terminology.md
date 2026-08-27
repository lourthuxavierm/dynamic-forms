# Terminology

- Status: Active Phase 0 baseline
- Owner: Documentation maintainers
- Last verified: 2026-08-25
- Applies to: All public project documentation

Use these terms consistently so package names, architectural concepts, and UI
technology are not confused.

## Canonical terms

| Term | Definition | Usage rule |
| --- | --- | --- |
| Dynamic Forms | The complete project and package ecosystem. | Capitalize when naming the project. |
| Core | Framework-independent schemas, state, validation, conditions, dependencies, data sources, registries, and events in `@dynamic-forms/core`. | Do not attribute rendering or framework lifecycle to Core. |
| Adapter | A package that integrates Core with a framework or external contract. | Name the adapted system, such as React adapter or future Angular adapter. |
| Renderer | A package or component layer that turns schema and state into user interface elements. | Do not use renderer for Core state processing. |
| Headless React | React context, hooks, subscriptions, and renderer-neutral components in `@dynamic-forms/react`. | It does not provide the default browser controls or stylesheet. |
| React HTML | The shipped `@dynamic-forms/react-html` renderer. It renders browser-native HTML elements through React. | Preferred name for the current renderer. |
| Browser-native control | An HTML element or semantic composition using browser behavior instead of a third-party component library. | This describes the control technology, not framework independence. |
| Native HTML | A descriptive phrase for browser-native elements. | Qualify it as React HTML when referring to the shipped renderer. Do not imply a standalone DOM renderer. |
| Standalone Native HTML/DOM renderer | A future renderer usable without React. | Always label Planned until a public implementation exists. |
| HTML compatibility package | `@dynamic-forms/html`, which forwards `@dynamic-forms/react-html`. | Do not call it a separate renderer or recommend it for new applications. |
| Angular adapter | A future Angular lifecycle/state integration. | Always label Planned until implemented and tested. |
| Angular HTML | A future Angular renderer using browser-native HTML controls. | Always label Planned until implemented and tested. |
| Field type | The schema `type` value selecting field behavior. | Distinguish leaf controls from structural `object` and `array` fields. |
| Control | A renderer implementation for a leaf field type. | Do not include object and array in the React HTML 42-control count. |
| Structural field | An `object` or `array` field containing child fields. | Document recursive value and path behavior. |
| Layout node | Renderer layout metadata arranging fields without changing their stored values. | Distinguish layout from structural fields. |
| Stable | Covered by an explicit versioned compatibility contract. | Do not infer stability from version 0.1.0. |
| Implemented | Present in public source and backed by relevant automated tests. | This does not automatically mean fully documented or release-ready. |
| Documented | Implemented and covered by a canonical verified guide or reference. | Link the canonical page. |
| Experimental | Implemented but outside the stable compatibility guarantee. | State limitations and migration risk. |
| Placeholder | A package or marker exists without the advertised integration. | Do not provide usage instructions. |
| Planned | No supported public implementation exists. | Use future tense and do not present speculative APIs as final. |

## Avoid ambiguous wording

| Avoid | Prefer |
| --- | --- |
| “the HTML package” when the package is unclear | `@dynamic-forms/react-html` or `@dynamic-forms/html` |
| “framework-free HTML renderer” for current code | “React HTML renderer using browser-native controls” |
| “Angular support” | “Angular support is planned” |
| “all controls are stable” | “the 42 controls in `V1_HTML_FIELD_TYPES` are the v1 leaf-control contract” |
| “HTML and React renderers” for the same implementation | “headless React and the React HTML renderer” |
