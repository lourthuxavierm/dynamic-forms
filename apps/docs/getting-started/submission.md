# Handle submission

- Status: Documented
- Owner: React and React HTML maintainers
- Last verified: 2026-08-26
- Applies to: `@lourthuxavierm/dynamic-forms-react` and `@lourthuxavierm/dynamic-forms-react-html` 0.1.0
- Prerequisites: A validated React HTML form

## Outcome

Submit validated values, expose pending and failure states, and avoid treating
client validation as server authorization.

## Add a safe asynchronous handler

```tsx verify
import { useState } from 'react';
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormProvider } from '@lourthuxavierm/dynamic-forms-react';
import { HtmlForm } from '@lourthuxavierm/dynamic-forms-react-html';

const schema: FormSchema = {
  id: 'submission-example',
  fields: [
    { name: 'email', type: 'email', label: 'Email', validation: { required: true } },
  ],
};

async function saveProfile(values: Readonly<Record<string, unknown>>): Promise<void> {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error(`Profile request failed with status ${response.status}`);
}

export function SubmissionForm() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  return (
    <FormProvider schema={schema} defaultValues={{ email: '' }}>
      <HtmlForm
        schema={schema}
        submitLabel={status === 'saving' ? 'Saving…' : 'Save profile'}
        onSubmit={async (values) => {
          setStatus('saving');
          try {
            await saveProfile(values);
            setStatus('saved');
          } catch {
            setStatus('failed');
          }
        }}
      />
      <p aria-live="polite">
        {status === 'saved' ? 'Profile saved.' : status === 'failed' ? 'Profile could not be saved.' : ''}
      </p>
    </FormProvider>
  );
}
```

## Submission contract

1. `HtmlForm` prevents the browser's default navigation.
2. It validates through the provider.
3. Invalid values remain in the form and do not reach `HtmlForm.onSubmit`.
4. Valid values are read from the store and passed as a readonly record.
5. The application owns transport, authentication, retries, server errors, and
   success navigation.

## Security boundary

Always validate and authorize again on the server. Client schemas improve user
experience but cannot establish trust. Do not log passwords, tokens, uploaded
file contents, or other sensitive values.

## Failure modes

- Prevent duplicate requests while a submission is pending in production UI.
- Preserve user input when a recoverable request fails.
- Map trusted server field errors to form errors instead of replacing the entire
  schema.
- Use idempotency or request identifiers for workflows where duplicate writes
  would be harmful.

Continue with [next steps](./next-steps.md).
