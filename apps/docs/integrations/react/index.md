# React integration

- Status: Implemented and documented
- Owner: React maintainers
- Last verified: 2026-08-27
- Applies to: `@dynamic-form-engine/react` 0.1.0

`@dynamic-form-engine/react` connects the framework-independent Core runtime to React.
It owns provider lifecycle, context, focused subscriptions, hooks, headless
schema components, error summaries, live regions, and typed control
registration. It does not ship browser controls or visual styling.

## Responsibility boundary

```text
@dynamic-form-engine/core -> @dynamic-form-engine/react -> application controls
                                           `-> @dynamic-form-engine/react-html
```

Use React alone when an application or design system supplies every control.
Use [React HTML](../react-html/index.md) when browser-native controls and the
default stylesheet are appropriate.

## Reference

- [Installation](./installation.md)
- [FormProvider and context](./form-provider.md)
- [DynamicForm and DynamicField](./dynamic-components.md)
- [Hooks and subscriptions](./hooks.md)
- [Validation and errors](./validation.md)
- [Custom controls](./custom-controls.md)
- [Accessibility](./accessibility.md)
- [SSR and lifecycle](./ssr.md)
- [Performance](./performance.md)
- [Testing](./testing.md)
