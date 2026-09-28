# Validation contract

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-09-28
- Applies to: `@dynamic-form-engine/core` 1.0.0-rc

Core separates *what* is validated (a `FormValidator`) from *when* validation
runs (an explicit `validate()` or `submit()` call). Nothing validates
implicitly on `setValue`, and data-source completion never triggers validation.

## Validators

```ts
type FormValidator<T> = (values: Readonly<T>, context?: { requestId: number; signal: AbortSignal })
  => FormErrors | Promise<FormErrors>;          // FormErrors = Record<path, message>

type Validator<TValue, T> = (value: TValue, values: Readonly<T>)
  => string | { code: string; message: string } | undefined | Promise<…>;
```

- A **form validator** receives the complete value set, so cross-field rules
  are ordinary code. It returns one message per failing path; an empty object
  means valid.
- A **field validator** returns `undefined` for success, a message string
  (reported with code `custom`), or a `ValidationIssue` with a stable `code`.
- Both may be asynchronous. Long-running work should observe `context.signal`.

`createFormValidator(schema)` builds a form validator from schema rules.
`createFieldValidators(field)` and `validateField(path, value, values,
validators)` expose the same rules per field, returning every issue with its
code.

```ts verify
import { FormStore, createFormValidator, type FormSchema, type FormValidator } from '@dynamic-form-engine/core';

const schema: FormSchema = {
  id: 'signup',
  fields: [
    { name: 'password', type: 'password', validation: { required: true, minLength: 8 } },
    { name: 'confirm', type: 'password', validation: { required: true } },
  ],
};
type Values = { password: string; confirm: string };

const schemaRules = createFormValidator(schema) as FormValidator<Values>;
const validator: FormValidator<Values> = async (values, context) => {
  const errors = await schemaRules(values, context);
  if (!errors.confirm && values.confirm !== values.password) errors.confirm = 'Passwords must match';
  return errors;
};

const store = new FormStore<Values>({ password: 'correct horse', confirm: 'correct' });
void store.validate(validator).then((valid) => console.log(valid, store.getState().errors));
```

## Schema rules

| Code | Rule | Checked when the value is |
| --- | --- | --- |
| `required` | `validation.required` or a true `requiredWhen` | always; empty means `undefined`, `null`, `false`, blank string, empty array, or `NaN` |
| `minLength`, `maxLength` | string length | a string |
| `min`, `max` | numeric bounds | a finite number after conversion |
| `pattern` | regular expression | a string |
| `multipleOf` | numeric step with floating-point tolerance | a non-empty finite number |
| `minItems`, `maxItems`, `uniqueItems` | array length and uniqueness (`JSON.stringify`) | an array |

Error **codes** are part of the stable API; message wording is not.

The schema validator:

- skips fields whose `visibleWhen` is false, including all of their children;
- evaluates `requiredWhen` against the values being validated;
- does **not** skip disabled or read-only fields;
- validates array item fields per index, reporting paths such as `items[2].sku`;
- stores only the first failing rule's message per path.

## Running validation

`store.validate(validator, { signal })` (and `FormRuntime.validate`):

1. Starts a new validation request, aborting the previous one. Its signal is
   aborted by `cancelValidation()`, `reset()`, runtime disposal, a newer
   `validate()` call, or the external `signal`.
2. Sets `validating: true` and notifies subscribers.
3. When the **current** request resolves, **replaces the entire error record**
   with the validator result, derives `valid`, emits `validate` with
   `{ valid, errors, values }`, and notifies subscribers once.
4. A superseded request never changes state. If its validator ignores the
   signal and resolves anyway, the result is discarded and the promise resolves
   with the current `valid` flag; if the validator observes the signal, the
   promise rejects with an `AbortError`, which callers can ignore.
5. If the current request throws, `validating` becomes `false`,
   `validationError` holds the error (unless it was an abort), the error goes to
   `FormStoreOptions.onAsyncError`, and the promise rejects.

Because step 3 replaces the error record, errors added with `setError` (for
example from a server response) are cleared by the next `validate()` unless
your validator returns them again.

## Submission

`submit(handler, validator?)` returns `undefined` without calling the handler
when the form is already submitting, is disabled, or fails validation.
Otherwise it sets `submitting`, calls the handler with the current values,
emits `submit` with the handler result, and always clears `submitting`, even
when the handler throws. See [submission](./submission.md).

## Explaining errors

`FormRuntime.explainFieldState(path).validation` reports whether a field's
current error came from a schema rule (and which `code`) or from outside Core,
which rules are configured, and which currently fail. See
[diagnostics](./diagnostics.md).

## Security boundary

Client validation improves interaction; it does not authorize anything.
Validate submitted values again on a trusted server.
