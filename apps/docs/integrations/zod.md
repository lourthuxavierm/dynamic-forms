# Zod validation

- Status: Release-ready adapter; renderer maturity varies below
- Owner: Core and adapter maintainers
- Last verified: 2026-08-29
- Applies to: `@dynamic-form-engine/zod` 0.1.0, Zod `^3.25.5 || ^4.0.0`

Use one Zod schema with the framework-independent `FormStore`, then share that
store with React HTML or Angular HTML. The adapter reports validation errors; it
never replaces stored values with Zod defaults, coercions, or transforms.

![Zod validation example with mapped field errors](/examples/zod-validation.png)

<FrameworkAvailability
  core="available"
  react="available"
  react-html="available"
  native-html="planned"
  angular="experimental"
  angular-html="experimental"
/>

## Install

<InstallBlock packages="@dynamic-form-engine/core @dynamic-form-engine/zod zod" />

Keep the adapter and Zod in application dependencies when validation runs in
the browser. The supported range is enforced by the package peer dependency and
the pinned [compatibility matrix](/project/zod-compatibility#phase-5-compatibility-matrix).

## Define one validation boundary

```ts
import { FormStore } from '@dynamic-form-engine/core';
import { createZodFormValidator } from '@dynamic-form-engine/zod';
import { z } from 'zod';

export interface ProfileValues extends Record<string, unknown> {
  email: string;
  password: string;
  confirmation: string;
}

export const profileSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least eight characters'),
  confirmation: z.string(),
}).refine((values) => values.password === values.confirmation, {
  path: ['confirmation'],
  message: 'Passwords must match',
});

export const validateProfile = createZodFormValidator<ProfileValues>(profileSchema);
export const profileStore = new FormStore<ProfileValues>({
  email: '', password: '', confirmation: '',
});
```

Use `profileStore.validate(validateProfile)` for an explicit validation action.
For submission, use `profileStore.submit(saveProfile, validateProfile)` so an
invalid form never calls the application service. Root schema issues appear at
`_form`; nested arrays use paths such as `contacts[0].email`.

## Connect a renderer

<FrameworkTabs initial="react-html">
  <template #react-html>

Pass `profileStore` and `validateProfile` to `FormProvider`. The provider
composes Zod validation after schema validation for manual validation and
submission. The same store error state drives React HTML summaries and controls.

```tsx
<FormProvider store={profileStore} schema={uiSchema} formValidator={validateProfile}>
  <HtmlForm
    schema={uiSchema}
    onSubmit={async (values) => saveProfile(values as ProfileValues)}
  />
</FormProvider>
```

  </template>
  <template #angular-html>

Provide `profileStore` when creating the Angular facade. Angular HTML reads the
same error state through facade signals. Application submission should validate
with Zod before calling the service.

```ts
const form = createDynamicForm<ProfileValues>({
  schema: uiSchema,
  store: profileStore,
  formValidator: validateProfile,
  onSubmit: saveProfile,
});
```

Angular and Angular HTML remain Experimental. The facade composes the supplied
validator into both `validate()` and `submit()`.

  </template>
  <template #native-html>

Standalone Native HTML/DOM rendering is planned. DOM applications can use the
Core `FormStore` and Zod validator directly, but this repository does not yet
publish a native DOM renderer or binding API.

  </template>
</FrameworkTabs>

## Validate one field

Use a field validator for isolated rules such as email syntax or an asynchronous
availability lookup:

```ts
import { validateField } from '@dynamic-form-engine/core';
import { createZodFieldValidator } from '@dynamic-form-engine/zod';
import { z } from 'zod';

const validateEmail = createZodFieldValidator(
  z.string().email('Enter a valid email'),
);

const result = await validateField(
  'email',
  profileStore.getValue('email'),
  profileStore.getValues(),
  [validateEmail],
);
```

Core assigns the returned issue to `email`, so paths inside a field schema are
ignored. Put rules comparing password and confirmation or any other fields in
the form schema.

## Production checklist

- Validate again on the server; browser validation is not authorization.
- Use form validation for cross-field and root errors.
- Expect asynchronous refinements and handle rejected operational promises.
- Parse explicitly outside the adapter when the application needs transformed output.
- Pin and test dependency updates through the four-cell compatibility matrix.

See [Zod compatibility](/project/zod-compatibility) for exact behavior and
maturity evidence.
