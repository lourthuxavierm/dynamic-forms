# Styling and theming

The HTML adapter has no runtime CSS dependency. Import the optional stylesheet once from your application entry point:

```ts
import '@lourthuxavierm/dynamic-forms-react-html/styles.css';
```

Without that import, controls remain semantic and unstyled. If the stylesheet is loaded but one form must opt out, pass `unstyled` to `HtmlForm`.

## Form settings

```tsx
<HtmlForm colorScheme="auto" density="standard" dir="ltr" />
```

- `colorScheme`: `light`, `dark`, or `auto`.
- `density`: `compact`, `standard`, or `comfortable`.
- `dir`: `ltr`, `rtl`, or `auto`.

## Tokens

Override tokens on a form or application container. The stylesheet uses a named cascade layer and low-specificity `:where()` selectors, so overrides do not require `!important`.

```css
@layer app {
  .billing-form {
    --df-color-primary: #6d28d9;
    --df-color-error: #be123c;
    --df-field-gap: 1.25rem;
    --df-control-height: 2.75rem;
    --df-border-radius: 0.625rem;
  }
}
```

The default theme supports system dark mode, forced-colors mode, reduced motion, logical RTL alignment, and compact/comfortable density. Consumer applications remain responsible for testing their token overrides against WCAG contrast requirements.
