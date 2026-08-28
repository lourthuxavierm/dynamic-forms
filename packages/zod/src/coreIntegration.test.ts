import { describe, expect, it, vi } from 'vitest';
import { FormStore, validateField } from '@dynamic-forms/core';
import { z } from 'zod';
import { createZodFieldValidator } from './fieldValidator';
import { createZodFormValidator } from './formValidator';

interface ProfileValues extends Record<string, unknown> {
  email: string;
  password: string;
  confirmation: string;
}

const profileSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least eight characters'),
  confirmation: z.string(),
}).refine((values) => values.password === values.confirmation, {
  path: ['confirmation'],
  message: 'Passwords must match',
});

describe('Core integration examples', () => {
  it('validates and submits through the same FormStore used by renderers', async () => {
    const store = new FormStore<ProfileValues>({
      email: 'invalid',
      password: 'password',
      confirmation: 'different',
    });
    const formValidator = createZodFormValidator<ProfileValues>(profileSchema);

    await expect(store.validate(formValidator)).resolves.toBe(false);
    expect(store.getState().errors).toEqual({
      email: 'Enter a valid email',
      confirmation: 'Passwords must match',
    });

    store.setValues({ email: 'person@example.com', confirmation: 'password' });
    const saveProfile = vi.fn(async (values: ProfileValues) => values.email);
    await expect(store.submit(saveProfile, formValidator)).resolves.toBe('person@example.com');
    expect(saveProfile).toHaveBeenCalledOnce();
  });

  it('runs a field schema through Core validateField', async () => {
    const emailValidator = createZodFieldValidator(
      z.string().email('Enter a valid email'),
    );
    const result = await validateField('email', 'invalid', { email: 'invalid' }, [emailValidator]);

    expect(result).toEqual({
      valid: false,
      errors: [{ field: 'email', code: expect.any(String), message: 'Enter a valid email' }],
    });
  });
});
