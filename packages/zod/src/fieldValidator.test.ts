import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createZodFieldValidator } from './fieldValidator';
import type { ZodSchemaLike } from './types';

describe('createZodFieldValidator', () => {
  it('returns no issue for a valid value', async () => {
    const validator = createZodFieldValidator(z.string().min(2));
    await expect(validator('Ada', {})).resolves.toBeUndefined();
  });

  it('returns the first issue with its Zod code', async () => {
    const validator = createZodFieldValidator(z.string().min(3, 'Name is too short'));
    await expect(validator('A', {})).resolves.toMatchObject({
      code: 'too_small',
      message: 'Name is too short',
    });
  });

  it('awaits asynchronous refinements', async () => {
    const validator = createZodFieldValidator(z.string().refine(async (value) => {
      await Promise.resolve();
      return value !== 'taken';
    }, 'Value is already taken'));
    await expect(validator('taken', {})).resolves.toMatchObject({ message: 'Value is already taken' });
  });

  it('supports optional and nullable values', async () => {
    const validator = createZodFieldValidator(z.string().optional().nullable());
    await expect(validator(undefined, {})).resolves.toBeUndefined();
    await expect(validator(null, {})).resolves.toBeUndefined();
  });

  it('joins all messages in source order while preserving the first code', async () => {
    const validator = createZodFieldValidator(
      z.string().min(5, 'Too short').regex(/^A/, 'Must start with A'),
      { errorMode: 'all', joinMessages: (messages) => messages.join(' | ') },
    );
    await expect(validator('x', {})).resolves.toEqual({
      code: 'too_small',
      message: 'Too short | Must start with A',
    });
  });

  it('discards transformed output and leaves the input unchanged', async () => {
    const value = { name: '  Ada  ' };
    const validator = createZodFieldValidator(
      z.object({ name: z.string() }).transform(({ name }) => name.trim()),
    );
    await expect(validator(value, {})).resolves.toBeUndefined();
    expect(value).toEqual({ name: '  Ada  ' });
  });

  it('provides a stable fallback for an empty failure', async () => {
    const schema: ZodSchemaLike<string> = {
      safeParseAsync: async () => ({ success: false, error: { issues: [] } }),
    };
    await expect(createZodFieldValidator(schema)('x', {})).resolves.toEqual({
      code: 'zod',
      message: 'Validation failed',
    });
  });

  it('propagates operational exceptions', async () => {
    const failure = new Error('validation service unavailable');
    const schema: ZodSchemaLike<string> = {
      safeParseAsync: async () => { throw failure; },
    };
    await expect(createZodFieldValidator(schema)('x', {})).rejects.toBe(failure);
  });
});
