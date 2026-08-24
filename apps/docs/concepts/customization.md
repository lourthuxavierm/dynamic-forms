# Custom fields and validation

## HTML registry override

The HTML adapter exposes registry factories and component contracts for additive controls or intentional overrides. Keep portable behavior in Core and browser rendering in the HTML package.

```tsx
import type { FieldComponentProps } from '@dynamic-forms/react';
import { createHtmlRegistry, HtmlForm } from '@dynamic-forms/react-html';

function UppercaseField(props: FieldComponentProps<string>) {
  return (
    <input
      name={props.name}
      value={props.value ?? ''}
      onChange={(event) => props.setValue(event.currentTarget.value.toUpperCase())}
    />
  );
}

const registry = createHtmlRegistry({ uppercase: UppercaseField });

export function CustomForm() {
  return <HtmlForm registry={registry} />;
}
```

## Registry boundaries

Core `FieldRegistry` stores generic field definitions. React `DynamicField` consumes the Core registry. The HTML renderer uses its component map and fails fast when a field type has no registered control.

## Custom validation

Use schema constraints for portable validation and Core validators for application-specific rules. Keep network-backed validation cancellable and prevent stale results from replacing newer field state.
