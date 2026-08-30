# Angular integration

- Status: Experimental implementation
- Owner: Angular maintainers
- Last verified: 2026-08-27
- Applies to: `@lourthuxavierm/dynamic-forms-angular` 0.1.0

`@lourthuxavierm/dynamic-forms-angular` is the headless Angular 22 adapter for Core. It ships a
typed `DynamicFormFacade`, readonly signals, focused field signals, DI providers,
an RxJS event bridge, explicit disposal, and a whole-form
`ControlValueAccessor` directive. It does not render browser controls.

## Current support boundary

The first release is Experimental. It is production-built and tested on Angular
22.1.3, TypeScript 6.0.2, RxJS 7.8.2, Node 24.15, and zoneless change detection.
Numeric peer ranges are published in the package manifest, but broader matrix
certification remains a release gate.

## Guides

- [Installation](./installation.md)
- [Providers and lifecycle](./providers.md)
- [Dynamic form facade](./dynamic-form.md)
- [Form state and signals](./form-state.md)
- [RxJS events](./rxjs.md)
- [Reactive Forms](./reactive-forms.md)
- [Validation](./validation.md)
- [Customization](./customization.md)
- [Testing](./testing.md)
