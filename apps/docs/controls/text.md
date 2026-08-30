# Text and hidden controls

- Status: Documented
- Owner: React HTML maintainers
- Last verified: 2026-08-26
- Applies to: React HTML v1 controls

## Compatibility

All controls on this page are stable in React HTML. Standalone Native HTML/DOM
and Angular HTML renderers are planned.

| Type | Native element | Stored value | Configuration and limitations |
| --- | --- | --- | --- |
| `text` | `input[type=text]` | String | Placeholder, required, length, and pattern rules. |
| `textarea` | `textarea` | String | `rows` through text configuration; multiline text. |
| `password` | `input[type=password]` | String | Never log or persist cleartext unintentionally; browser password behavior applies. |
| `email` | `input[type=email]` | String | Native input semantics plus schema validation; Core does not add an implicit email regex. |
| `url` | `input[type=url]` | String | URL trust and allowlisting remain application/server responsibilities. |
| `hidden` | `input[type=hidden]` | Schema/store value | Not visible or user-editable; never use it as an authorization boundary. |

## Schema example

```ts verify
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';

export const textSchema: FormSchema = {
  id: 'text-controls',
  fields: [
    { name: 'name', type: 'text', validation: { required: true, minLength: 2 } },
    { name: 'bio', type: 'textarea', config: { rows: 4 } },
    { name: 'password', type: 'password', validation: { required: true } },
    { name: 'email', type: 'email' },
    { name: 'website', type: 'url' },
    { name: 'workflowId', type: 'hidden', defaultValue: 'onboarding' },
  ],
};
```

## Accessibility

Visible controls require a label; placeholder text is not a replacement.
Descriptions and errors are connected through generated IDs. Password values
must not be exposed in live regions, diagnostics, or error messages.

## Empty and submitted values

Text controls store strings. Whether empty optional values remain `''` or are
normalized further is an application contract. Hidden values are submitted from
the store and must be validated on the server like every other client value.
