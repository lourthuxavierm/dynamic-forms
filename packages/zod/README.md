# @dynamic-forms/zod

Zod validation adapter foundation for Dynamic Forms.

## Current maturity

This package is **Experimental**. Phase 4 provides form-level and field-level
validation, structural types, and deterministic issue mapping. The dual-major
compatibility matrix is not complete.

Use it only with the Experimental compatibility policy and keep authoritative
server validation in place.

## Architecture

- Depends on `@dynamic-forms/core`.
- Keeps Zod out of Core and renderer packages.
- Supports peer ranges `^3.25.5 || ^4.0.0` through a pinned four-cell CI matrix.
- Uses a structural asynchronous schema contract in declarations.
- Will validate without silently applying parsed/transformed output to FormStore.

## Available Phase 2 utilities

- `zodPathToFieldPath`
- `zodIssueToValidationIssue`
- `normalizeZodIssue`
- `zodIssuesToFormErrors`
- `createZodFormValidator`
- `createZodFieldValidator`

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

## Experimental field validation

```ts
import { createZodFieldValidator } from '@dynamic-forms/zod';
import { z } from 'zod';

const validateEmail = createZodFieldValidator(
  z.string().email('Enter a valid email address'),
);
```

Field schemas always use `safeParseAsync`, so asynchronous refinements work.
Issue paths are intentionally ignored because Core assigns the result to the
current field. Put rules that compare multiple fields in
`createZodFormValidator`. Parsed or transformed output is discarded, and
operational exceptions propagate to the caller.

See `docs/architecture/decisions/zod-adapter.md` for the accepted decision.
