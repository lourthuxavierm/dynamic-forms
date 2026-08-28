import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createZodFormValidator } from './formValidator';
import type { ZodSchemaLike } from './types';

interface ProfileValues extends Record<string, unknown> {
  email: string;
  contacts: Array<{ email: string }>;
}

describe('createZodFormValidator', () => {
  it('returns no errors for valid values', async () => {
    const validator = createZodFormValidator<ProfileValues>(z.object({
      email: z.string().email(),
      contacts: z.array(z.object({ email: z.string().email() })),
    }));
    await expect(validator({
      email: 'person@example.com',
      contacts: [{ email: 'contact@example.com' }],
    })).resolves.toEqual({});
  });

  it('maps nested array issues to Core form errors', async () => {
    const validator = createZodFormValidator<ProfileValues>(z.object({
      email: z.string().email('Email is invalid'),
      contacts: z.array(z.object({ email: z.string().email('Contact email is invalid') })),
    }));
    await expect(validator({
      email: 'invalid',
      contacts: [{ email: 'invalid' }],
    })).resolves.toEqual({
      email: 'Email is invalid',
      'contacts[0].email': 'Contact email is invalid',
    });
  });

  it('maps cross-field and root issues', async () => {
    type PasswordValues = { password: string; confirmation: string };
    const schema = z.object({
      password: z.string(),
      confirmation: z.string(),
    }).superRefine((values, context) => {
      if (values.password !== values.confirmation) {
        context.addIssue({ code: 'custom', path: ['confirmation'], message: 'Passwords must match' });
        context.addIssue({ code: 'custom', message: 'Profile cannot be submitted' });
      }
    });
    const validator = createZodFormValidator<PasswordValues>(schema);
    await expect(validator({ password: 'one', confirmation: 'two' })).resolves.toEqual({
      confirmation: 'Passwords must match',
      _form: 'Profile cannot be submitted',
    });
  });

  it('awaits asynchronous refinements', async () => {
    type UsernameValues = { username: string };
    const schema = z.object({
      username: z.string().refine(async (value) => {
        await Promise.resolve();
        return value !== 'taken';
      }, 'Username is already taken'),
    });
    const validator = createZodFormValidator<UsernameValues>(schema);
    await expect(validator({ username: 'taken' })).resolves.toEqual({
      username: 'Username is already taken',
    });
  });

  it('supports all-message mode in source order', async () => {
    type CodeValues = { code: string };
    const validator = createZodFormValidator<CodeValues>(
      z.object({ code: z.string().min(5, 'Too short').regex(/^A/, 'Must start with A') }),
      { errorMode: 'all', joinMessages: (messages) => messages.join(' | ') },
    );
    await expect(validator({ code: 'x' })).resolves.toEqual({
      code: 'Too short | Must start with A',
    });
  });

  it('does not apply transformed output to input values', async () => {
    type NameValues = { name: string };
    const values: NameValues = { name: '  Ada  ' };
    const validator = createZodFormValidator<NameValues>(
      z.object({ name: z.string().transform((value) => value.trim()) }),
    );
    await expect(validator(values)).resolves.toEqual({});
    expect(values).toEqual({ name: '  Ada  ' });
  });

  it('propagates exceptions instead of hiding operational failures', async () => {
    type Values = { value: string };
    const failure = new Error('refinement service unavailable');
    const schema: ZodSchemaLike<Values> = {
      safeParseAsync: async () => {
        throw failure;
      },
    };
    const validator = createZodFormValidator(schema);
    await expect(validator({ value: 'x' })).rejects.toBe(failure);
  });

  it('does not share state between concurrent validations', async () => {
    type Values = { value: string };
    const validator = createZodFormValidator<Values>(
      z.object({ value: z.string().refine((value) => value === 'valid', 'Value is invalid') }),
    );
    const [invalid, valid] = await Promise.all([
      validator({ value: 'invalid' }),
      validator({ value: 'valid' }),
    ]);
    expect(invalid).toEqual({ value: 'Value is invalid' });
    expect(valid).toEqual({});
  });
});
