# React package

Status: Implemented. `@lourthuxavierm/dynamic-forms-react` exports `FormProvider`, context, `useForm`, field/form hooks, subscriptions, data-source and event hooks, `DynamicField`, `DynamicForm`, error summary and live-region components, and typed React registration.

Use one provider per independent form. Hooks require that provider and subscribe through `useSyncExternalStore`; prefer field hooks or selectors over broad state subscriptions. React owns no visual design; the HTML adapter consumes its renderer-neutral contracts. See [React setup](../getting-started/react-setup.md) and [customization](../concepts/customization.md).
