import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  normalizeZodIssue,
  zodIssuesToFormErrors,
  zodIssueToValidationIssue,
} from './issues';
import type { ZodIssueLike } from './types';

const issue = (path: ZodIssueLike['path'], message: string, code = 'custom'): ZodIssueLike => ({
  path,
  message,
  code,
});

describe('Zod issue mapping', () => {
  it('preserves issue codes and supplies a fallback', () => {
    expect(zodIssueToValidationIssue(issue(['email'], 'Invalid', 'invalid_format'))).toEqual({
      code: 'invalid_format',
      message: 'Invalid',
    });
    expect(zodIssueToValidationIssue({ path: [], message: 'Invalid' })).toEqual({
      code: 'zod',
      message: 'Invalid',
    });
  });

  it('normalizes nested and root issues', () => {
    expect(normalizeZodIssue(issue(['contacts', 0, 'email'], 'Invalid')).field).toBe('contacts[0].email');
    expect(normalizeZodIssue(issue([], 'Invalid'), 'root').field).toBe('root');
  });

  it('keeps the first message for a path by default', () => {
    expect(zodIssuesToFormErrors([
      issue(['email'], 'First'),
      issue(['email'], 'Second'),
      issue([], 'Form error'),
    ])).toEqual({ email: 'First', _form: 'Form error' });
  });

  it('joins all messages in stable order with a caller formatter', () => {
    expect(zodIssuesToFormErrors([
      issue(['email'], 'First'),
      issue(['email'], 'Second'),
    ], {
      errorMode: 'all',
      joinMessages: (messages) => messages.join(' | '),
    })).toEqual({ email: 'First | Second' });
  });

  it('maps real Zod 4 issues through the structural contract', async () => {
    const result = await z.object({
      contacts: z.array(z.object({ email: z.email() })),
    }).safeParseAsync({ contacts: [{ email: 'invalid' }] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(zodIssuesToFormErrors(result.error.issues)).toHaveProperty('contacts[0].email');
    }
  });

  it('creates own properties for reserved object names', () => {
    const errors = zodIssuesToFormErrors([issue(['__proto__'], 'Blocked')]);
    expect(Object.hasOwn(errors, '__proto__')).toBe(true);
    expect(errors.__proto__).toBe('Blocked');
  });
});
