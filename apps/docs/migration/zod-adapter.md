# Migrating to the Zod adapter

- Status: Maintained release migration path
- Owner: Core and adapter maintainers
- Last verified: 2026-08-29
- Applies to: `@dynamic-forms/zod` 0.1.0, Zod `^3.25.5 || ^4.0.0`

Adopt the adapter without changing renderer, stored-value, and submission
behavior in the same rollout. The adapter is validation-only: it maps Zod
issues into Core errors but does not write parsed output back to `FormStore`.

## Choose the source migration

| Current implementation | Replace with | Preserve during migration |
| --- | --- | --- |
| Direct `safeParseAsync` plus manual issue mapping | `createZodFormValidator` | Existing path and message expectations |
| Custom Core `FormValidator` | `createZodFormValidator` | Root errors, cross-field rules, and async behavior |
| Isolated custom field validator | `createZodFieldValidator` | Current field ownership and validation timing |
| Parsing that applies defaults, coercions, or transforms | Explicit submission parse | Parsed output type and persistence contract |

Do not migrate schema validation, renderer integration, persistence format, and
server authorization in one change.

## Establish a baseline

Before replacing validation code, capture contract tests for:

- valid and invalid submission outcomes;
- nested object and array paths such as `contacts[0].email`;
- root and cross-field issues;
- the first message shown when one path has multiple issues;
- asynchronous refinement rejection and operational exceptions;
- values sent to the application service.

Record current error telemetry and submission rejection rates. These become
rollout comparison signals, not just test fixtures.

## Replace manual form mapping

Before:

```ts
const validateProfile = async (values: ProfileValues) => {
  const result = await profileSchema.safeParseAsync(values);
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [
    issue.path.join('.') || '_form',
    issue.message,
  ]));
};
```

After:

```ts
import { createZodFormValidator } from '@dynamic-forms/zod';

const validateProfile = createZodFormValidator<ProfileValues>(profileSchema);
```

The adapter maps numeric segments with brackets, maps an empty path to `_form`,
and keeps the first message per path by default. If the previous mapper joined
messages, select that behavior explicitly:

```ts
const validateProfile = createZodFormValidator<ProfileValues>(profileSchema, {
  errorMode: 'all',
  joinMessages: (messages) => messages.join(' | '),
});
```

## Preserve transformed submission data

Do not assume a successful adapter result changes stored values. If the current
application relies on Zod coercions, defaults, or transforms, parse explicitly
inside the submission boundary and send the parsed result to the service:

```ts
const validateProfile = createZodFormValidator<ProfileValues>(profileSchema);

await profileStore.submit(async (values) => {
  const parsed = await profileSchema.parseAsync(values);
  await saveProfile(parsed);
}, validateProfile);
```

This intentionally validates before submission and parses again when producing
the service payload. Keep that cost visible in performance tests. Alternatively,
retain the previous combined parse-and-submit function until the application has
an explicit parsed-value boundary.

## Migrate field validators selectively

```ts
import { createZodFieldValidator } from '@dynamic-forms/zod';
import { z } from 'zod';

const validateEmail = createZodFieldValidator(
  z.string().email('Enter a valid email'),
);
```

Field issue paths are ignored because Core assigns the issue to the owning
field. Keep password confirmation and every other multi-value rule in the form
schema. Migrate one field group at a time when validation timing affects users.

## Framework rollout

React HTML and Angular HTML share the same Core store with the adapter. Keep the
renderer and UI schema unchanged, inject or expose the existing store, and add
the Zod validation boundary described in the [integration guide](/integrations/zod).
Standalone Native HTML/DOM rendering remains planned.

For Angular, pass `formValidator: validateProfile` to `createDynamicForm`. For
React, pass `formValidator={validateProfile}` to `FormProvider`. Both adapters
compose the application validator after schema validation for manual validation
and submission; application errors take precedence for the same path.

## Canary and stop conditions

Roll out behind an application-owned feature flag when validation affects a
high-value workflow. Compare old and new validators on cloned values in tests or
non-mutating diagnostics; do not let two validators race to update one live
store.

Stop the rollout when any of these occurs:

- the new validator accepts a submission rejected by the server;
- error paths no longer focus or announce the expected control;
- transformed service payloads differ from the baseline;
- validation latency or rejected operational promises exceed the agreed budget;
- Zod or adapter versions fall outside the pinned compatibility policy.

## Rollback

Keep the previous validator callable for one release window. Rollback consists
of switching the application-owned validator selection to the previous function
and removing the adapter only after traffic is stable. Because the adapter does
not migrate or rewrite persisted values, rollback requires no data conversion
unless the application separately changed its submission parse.

Re-run baseline contract tests after rollback. Do not suppress server-side
validation or authorization errors to make client metrics appear equivalent.

## Completion checklist

- The installed Zod version is covered by the [compatibility matrix](/project/zod-compatibility#phase-5-compatibility-matrix).
- Error path, message, async, and cross-field tests pass.
- Parsed submission output is explicit and tested.
- React or Angular renderer error presentation remains accessible.
- Server validation remains authoritative.
- Canary metrics, stop conditions, and rollback ownership are recorded.
- The previous validator is removed only after the rollback window closes.
