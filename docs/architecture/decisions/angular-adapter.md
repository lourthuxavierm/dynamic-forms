# ADR: Angular adapter architecture

- Status: Proposed; approval required before implementation
- Decision owners: Core and future Angular maintainers
- Last reviewed: 2026-08-27
- Scope: Future Angular and Angular HTML packages

## Context

Dynamic Forms currently ships a framework-independent Core runtime, a headless
React adapter, and a React HTML renderer. No Angular package, public export,
playground, or compatibility promise exists. Angular support must preserve Core
as the single schema and runtime contract while fitting Angular dependency
injection, signals, change detection, forms interoperability, and SSR.

## Decision

Use two package boundaries:

- proposed `@dynamic-forms/angular` for lifecycle, dependency injection,
  signals, renderer-neutral directives/components, and interoperability;
- proposed `@dynamic-forms/angular-html` for browser-native Angular controls,
  layouts, registry defaults, styling, and accessibility markup.

Neither package name is installable or reserved until manifests and exports are
merged. Core must not import Angular, RxJS, Zone.js, or either proposed package.

## Runtime ownership

`FormStore` remains the authoritative state container. The Angular adapter owns
creation/injection, lifecycle cleanup, signal projections, event bridging, and
change-detection integration. It must not fork validation, conditions,
dependencies, data-source, or event semantics.

```text
FormSchema -> @dynamic-forms/core -> proposed Angular adapter
                                      |       |
                                      |       `-> signals / optional streams
                                      `-> proposed Angular HTML renderer
```

## Signals and RxJS

Signals are the primary synchronous view-state API. Store subscriptions update
readonly signals; commands continue to call Core. RxJS is an opt-in boundary for
Core events, asynchronous integrations, and applications already organized
around Observables. Signals and Observables must never become competing stores.

## Dependency injection and providers

Use environment providers for application-level defaults and component-level
providers for each isolated form runtime. Registry contributions use typed
multi-providers whose merge and collision policy is deterministic. Feature
providers must be tree-shakable and avoid eager renderer imports.

## Change detection and zoneless operation

Components use OnPush change detection and signals. Correctness must not depend
on `NgZone`, patched browser APIs, or manual global change detection. External
callbacks enter the signal bridge explicitly. Cleanup uses Angular lifecycle
facilities such as `DestroyRef` rather than implicit zone teardown.

## Angular Reactive Forms interoperability

Core remains authoritative for schema-driven forms. A bridge may expose the
whole Dynamic Forms value as an Angular control through `ControlValueAccessor`
and may offer an explicit `FormGroup` projection. Mirroring must be opt-in,
directional, loop-safe, and documented for disabled state, validation errors,
pending state, update timing, reset, and disposal.

Individual built-in renderer controls use an internal typed field-control
contract. They must not create an Angular `FormControl` per field merely to
render Core state. Custom controls may use a CVA adapter when integrating an
existing Angular control.

## SSR and hydration

Server rendering must produce deterministic markup from serializable schema and
initial state. Browser APIs are guarded and activated after render. IDs, layout,
registry order, locale, direction, and initial data must match during hydration.
Data-source transfer and replay require an explicit cache policy; requests must
not silently execute twice.

## Lazy controls

The renderer registry may resolve a component synchronously or through a typed
lazy loader. Lazy loading uses Angular dynamic imports and a documented loading,
error, retry, and preloading contract. Core field types and values cannot depend
on chunk boundaries.

## Errors, focus, and accessibility

Unknown field types, control-load failures, and render failures require typed
diagnostics containing field path and type. Invalid submission follows Core
validation ordering, exposes an accessible summary, and focuses the first
invalid control under a configurable policy. Conditional removal must preserve
logical focus.

## Consequences

- Core behavior stays portable and cross-renderer tests can be reused.
- Applications can adopt the headless adapter without the HTML renderer.
- Signals provide Angular-native rendering without making RxJS a second store.
- Reactive Forms integration is possible but explicitly costs synchronization.
- Two packages and a bridge increase release and compatibility testing scope.

## Rejected alternatives

- One combined Angular package: prevents headless and design-system adoption.
- Reimplementing Core with Angular signals: creates behavioral drift.
- RxJS-only public state: weakens template ergonomics and zoneless alignment.
- Mandatory `FormGroup` mirroring: duplicates state and validation for every form.
- React HTML wrapping or custom elements: does not provide Angular lifecycle,
  DI, template, SSR, or forms integration.

## Approval gate

The ADR becomes Accepted only after Core, Angular, accessibility, and
documentation maintainers approve the package split, ownership model,
interoperability boundary, SSR policy, and version-support process. API names
remain changeable while this ADR is Proposed.
