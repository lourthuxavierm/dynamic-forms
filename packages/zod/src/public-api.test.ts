import { describe, expect, expectTypeOf, it } from 'vitest';
import * as adapter from './index';
import {
  createZodFormValidator,
  zodIssuesToFormErrors,
  zodIssueToValidationIssue,
  zodPathToFieldPath,
} from './index';
import type { ZodAdapterOptions, ZodSchemaLike } from './index';

describe('@dynamic-forms/zod Phase 1 public surface', () => {
  it('exports form validation without a premature field factory', () => {
    expect(adapter).not.toHaveProperty('ZOD_ADAPTER');
    expect(adapter).not.toHaveProperty('createZodFieldValidator');
    expect(createZodFormValidator).toBeTypeOf('function');
    expect(zodPathToFieldPath).toBeTypeOf('function');
    expect(zodIssuesToFormErrors).toBeTypeOf('function');
    expect(zodIssueToValidationIssue).toBeTypeOf('function');
  });

  it('publishes framework-neutral structural contracts', () => {
    expectTypeOf<ZodSchemaLike<{ email: string }>['safeParseAsync']>().toBeFunction();
    expectTypeOf<ZodAdapterOptions['errorMode']>().toEqualTypeOf<'first' | 'all' | undefined>();
  });
});
