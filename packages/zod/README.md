# @dynamic-forms/zod

Zod validation adapter foundation for Dynamic Forms.

## Current maturity

This package is **Experimental**. Phase 3 provides form-level validation,
structural types, and deterministic issue mapping. Field-level validator
factories and the dual-major compatibility matrix are not complete.

Use it only with the Experimental compatibility policy and keep authoritative
server validation in place.

## Architecture

- Depends on `@dynamic-forms/core`.
- Keeps Zod out of Core and renderer packages.
- Targets candidate peer ranges `^3.25.0 || ^4.0.0`.
- Uses a structural asynchronous schema contract in declarations.
- Will validate without silently applying parsed/transformed output to FormStore.

## Available Phase 2 utilities

- `zodPathToFieldPath`
- `zodIssueToValidationIssue`
- `normalizeZodIssue`
- `zodIssuesToFormErrors`
- `createZodFormValidator`

Root issues map to `_form`. Numeric segments use Core bracket notation, such
as `contacts[0].email`. The default keeps the first message for each path;
`errorMode: 'all'` enables deterministic joining.

## Experimental form validation

```ts
import { createZodFormValidator } from '@dynamic-forms/zod';
import { z } from 'zod';

type Values = { email: string };
const validate = createZodFormValidator<Values>(
  z.object({ email: z.email() }),
);
```

The validator always awaits `safeParseAsync`. Successful parsed or transformed
output is discarded; validation never mutates or replaces FormStore values.

See `docs/architecture/decisions/zod-adapter.md` for the accepted decision.
