# @dynamic-forms/zod

Zod validation adapter foundation for Dynamic Forms.

## Current maturity

This package is **Release-ready** for the documented 0.1.x contract. It provides
form-level and field-level validation, structural types, deterministic issue
mapping, a pinned dual-major matrix, and an automated publish-artifact gate.

The package remains pre-1.0, so review migration guidance before upgrades and
keep authoritative server validation in place.

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

## Form validation

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

## Field validation

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
Application adoption and rollback guidance is available at
`apps/docs/migration/zod-adapter.md`.
