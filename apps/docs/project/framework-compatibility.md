# Framework compatibility

- Status: Active
- Owner: Core and integration maintainers
- Last verified: 2026-08-27
- Applies to: Repository version 0.1.0

## Current architecture

```text
                         @lourthuxavierm/dynamic-forms-core
                           /             \
              @lourthuxavierm/dynamic-forms-react   @lourthuxavierm/dynamic-forms-angular
                       |                       |
       @lourthuxavierm/dynamic-forms-react-html   @lourthuxavierm/dynamic-forms-angular-html
```

Core remains framework-independent. React HTML is the complete documented
renderer. Angular and Angular HTML now exist as Experimental Angular 22 packages.

## Integration matrix

| Capability | Core | React | React HTML | Angular | Angular HTML | Standalone DOM |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Schemas and Core runtime | Implemented | Consumes | Consumes | Consumes | Consumes | Planned consumer |
| Framework lifecycle | Not applicable | Documented | Consumes | Experimental | Consumes | Planned |
| Focused state APIs | Store subscriptions | Hooks | Hooks | Readonly signals | Signals | Planned |
| Stream events | Core emitter | Hook | Consumes | RxJS bridge | Consumes | Planned |
| Browser-native controls | Not applicable | Not provided | 42 stable | Not provided | 15 experimental | Planned |
| Object and array rendering | Contract | Headless | Documented | Core values | Deferred | Planned |
| Layout rendering | Contract | Boundary | Documented | Not applicable | Deferred | Planned |
| Static CSS | Not applicable | None | Documented | None | Experimental | Planned |
| Forms interoperability | Store API | React lifecycle | React form | Experimental CVA | Consumes | Planned |
| SSR/hydration | Runtime-safe | Foundation tested | App verification | Not certified | Not certified | Planned |

## Angular boundary

`@lourthuxavierm/dynamic-forms-angular` depends on Core and never on Angular HTML.
`@lourthuxavierm/dynamic-forms-angular-html` depends on the headless Angular adapter. Neither
dependency is allowed to enter Core. See [Angular compatibility](./angular-compatibility.md).

## Compatibility package

`@lourthuxavierm/dynamic-forms-html` still forwards React HTML. It is unrelated to Angular HTML
and is not a standalone DOM renderer.
