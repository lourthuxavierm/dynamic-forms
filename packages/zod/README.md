# @dynamic-form-engine/zod

Zod validation adapter foundation for Dynamic Forms.

## Current maturity

This package is **Release-ready** at `1.0.0-rc`. It provides form-level and
field-level validation, structural types, deterministic issue mapping, a pinned
four-version Zod matrix (3.25.5, 3.25.76, 4.0.0, 4.5.1), and an automated
publish-artifact gate. Its public API is recorded in `api-report.json` under
Core's stability policy (`@dynamic-form-engine/core/STABILITY.md`), and its
types resolve for bundler, Node ESM, and Node CommonJS consumers. Keep
authoritative server validation in place.

## Architecture

- Depends on `@dynamic-form-engine/core`.
- Keeps Zod out of Core and renderer packages.
- Supports peer ranges `^3.25.5 || ^4.0.0` through a pinned four-cell CI matrix.
- Uses a structural asynchronous schema contract in declarations.
- Validates without applying parsed or transformed output to FormStore.

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
import { createZodFormValidator } from '@dynamic-form-engine/zod';
import { z } from 'zod';

type Values = { email: string };
const validate = createZodFormValidator<Values>(
  z.object({ email: z.email() }),
);
```

The validator always awaits `safeParseAsync`. Successful parsed or transformed
output is discarded; validation never mutates or replaces FormStore values. If
the request's abort signal has already fired (a newer validation superseded it),
the validator rejects with the abort reason without parsing.

With React, pass it as `FormProvider formValidator`. The provider also runs it
for field-level validation (`onBlur`/`onChange`/`validate()`), so a field's Zod
error is not cleared while it still applies. It ignores errors for fields
hidden by `visibleWhen`, unless `validateHiddenFields` is set.

## Field validation

```ts
import { createZodFieldValidator } from '@dynamic-form-engine/zod';
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
