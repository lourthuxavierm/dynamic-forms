import { describe, expect, expectTypeOf, it } from 'vitest';
import * as adapter from './index';
import {
  createZodFormValidator,
  createZodFieldValidator,
  zodIssuesToFormErrors,
  zodIssueToValidationIssue,
  zodPathToFieldPath,
} from './index';
import type { ZodAdapterOptions, ZodFieldValidatorOptions, ZodSchemaLike } from './index';

describe('@lourthuxavierm/dynamic-forms-zod Phase 1 public surface', () => {
  it('exports form and field validation factories', () => {
    expect(adapter).not.toHaveProperty('ZOD_ADAPTER');
    expect(createZodFieldValidator).toBeTypeOf('function');
    expect(createZodFormValidator).toBeTypeOf('function');
    expect(zodPathToFieldPath).toBeTypeOf('function');
    expect(zodIssuesToFormErrors).toBeTypeOf('function');
    expect(zodIssueToValidationIssue).toBeTypeOf('function');
  });

  it('publishes framework-neutral structural contracts', () => {
    expectTypeOf<ZodSchemaLike<{ email: string }>['safeParseAsync']>().toBeFunction();
    expectTypeOf<ZodAdapterOptions['errorMode']>().toEqualTypeOf<'first' | 'all' | undefined>();
    expectTypeOf<ZodFieldValidatorOptions['errorMode']>().toEqualTypeOf<'first' | 'all' | undefined>();
  });
});
