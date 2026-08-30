# Angular architecture

- Status: Accepted foundation; Experimental implementation
- Owner: Core and Angular maintainers
- Last verified: 2026-08-27
- Applies to: Angular and Angular HTML 0.1.0

Phase 9 established the package and state-ownership design. Phase 10 implements
the first slice as `@lourthuxavierm/dynamic-forms-angular` and `@lourthuxavierm/dynamic-forms-angular-html`.
Core remains authoritative and framework-independent.

| Layer | Current responsibility |
| --- | --- |
| Core | Schemas, store, validation, conditions, dependencies, data sources, events |
| Angular adapter | Facade lifecycle, readonly signals, RxJS events, DI, whole-form CVA |
| Angular HTML | Experimental standalone OnPush browser-control renderer and CSS |

## Design record

- [Runtime and packages](./runtime-and-packages.md)
- [Signals and RxJS](./signals-and-rxjs.md)
- [Reactive Forms](./reactive-forms.md)
- [Zoneless change detection](./change-detection.md)
- [SSR and hydration](./ssr-and-hydration.md)
- [Rendering, errors, and focus](./rendering.md)
- [Testing and release gates](./testing-and-release.md)
- [Open and deferred decisions](./open-decisions.md)

Use the current [Angular guide](../../integrations/angular/index.md) and
[Angular HTML guide](../../integrations/angular-html/index.md) for implemented APIs.
