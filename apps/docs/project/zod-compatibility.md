# Zod compatibility

- Status: Form and field validation Experimental
- Owner: Core and adapter maintainers
- Last verified: 2026-08-29
- Applies to: `@dynamic-forms/zod` 0.1.0

`@dynamic-forms/zod` now provides Experimental form-level and field-level
validation through `createZodFormValidator` and `createZodFieldValidator`.
The complete dual-major matrix is not available yet.

## Candidate version policy

| Zod line | Candidate range | Current support |
| --- | --- | --- |
| Zod 3 | `^3.25.0` | Not certified |
| Zod 4 | `^4.0.0` | Phase 4 behavior tested on 4.4.3; matrix not certified |
| Zod Mini | Not selected | Not supported |

The manifest range identifies versions intended for the implementation matrix.
Support begins only after package builds, declarations, and behavior tests pass
against both selected majors.

## Approved boundary

```text
Zod schema
    |
@dynamic-forms/zod
    |
Core FormValidator / Validator
    |
React, Angular, or another consumer
```

Core and renderers never import Zod. The adapter produces Core-compatible errors.

## Approved semantics

- Always accommodate asynchronous validation.
- Convert `['contacts', 0, 'email']` to `contacts[0].email`.
- Map an empty issue path to `_form`.
- Keep the first message per path by default.
- Make multiple-message joining explicit and deterministic.
- Do not silently apply Zod coercions, defaults, or transformed output to store values.
- Preserve server validation as the authoritative security boundary.

## Promotion gate

Experimental status remains until form and field validators, the dual-major
matrix, generated API reference, framework-neutral examples, migration guidance,
and the Zod release verifier all pass.

## Phase 1 foundation

- The placeholder runtime marker has been removed.
- Strict type checking and declaration-only output are configured.
- ESM and CommonJS bundles remain supported.
- `sideEffects: false` declares the type-only foundation tree-shakeable.
- Structural contracts do not expose a concrete Zod-major class.
- Validator factories were intentionally withheld until behavior tests existed.

## Phase 2 issue mapping

The following utilities are implemented and tested:

- `zodPathToFieldPath(path, rootErrorPath?)`
- `zodIssueToValidationIssue(issue)`
- `normalizeZodIssue(issue, rootErrorPath?)`
- `zodIssuesToFormErrors(issues, options?)`

The mapping distinguishes numeric array indexes from numeric-looking string
properties, preserves issue order, safely creates reserved keys such as
`__proto__`, and maps empty paths to `_form`. Fields containing Core path
separators and symbolic keys receive quoted diagnostic paths; Dynamic Forms
schema field names cannot use those segments.

The default `first` mode retains the first message for a field. The `all`
mode joins every message in source order using either `; ` or a caller-supplied
formatter.

## Phase 3 form validation

`createZodFormValidator<TValues>(schema, options?)` returns the Core
`FormValidator<TValues>` contract:

```ts
import { createZodFormValidator } from '@dynamic-forms/zod';
import { z } from 'zod';

type Profile = { email: string };
const validateProfile = createZodFormValidator<Profile>(
  z.object({ email: z.email('Enter a valid email') }),
);
```

It always awaits `safeParseAsync`, maps nested and root issues, supports
cross-field and asynchronous refinements, and propagates thrown operational
errors. Successful Zod output is discarded, so coercions, defaults, and
transforms never silently replace form state. Concurrent calls share no mutable
adapter state.

Client validation is not an authorization or security boundary; validate
submissions on the server.

## Phase 4 field validation

`createZodFieldValidator<TValue>(schema, options?)` returns the Core
`Validator<TValue>` contract:

```ts
import { createZodFieldValidator } from '@dynamic-forms/zod';
import { z } from 'zod';

const validateEmail = createZodFieldValidator(
  z.email('Enter a valid email'),
);
```

It awaits asynchronous refinements and returns `undefined` on success or one
Core `ValidationIssue` on failure. The default returns the first Zod issue;
`errorMode: 'all'` joins all messages deterministically while retaining the
first issue code. Empty structural failures receive a stable `zod` fallback.

Issue paths are ignored because Core associates the result with the field that
owns the validator. Rules that compare multiple values belong in
`createZodFormValidator`. Successful transformed output is discarded, input
values remain unchanged, and operational exceptions propagate to the caller.

See the repository ADR at
`docs/architecture/decisions/zod-adapter.md` for the complete decision.
