import { describe, expect, expectTypeOf, it } from 'vitest';
import * as adapter from './index';
import type { ZodAdapterOptions, ZodSchemaLike } from './index';

describe('@dynamic-forms/zod Phase 1 public surface', () => {
  it('does not expose the retired placeholder marker or premature factories', () => {
    expect(adapter).not.toHaveProperty('ZOD_ADAPTER');
    expect(adapter).not.toHaveProperty('createZodFormValidator');
    expect(adapter).not.toHaveProperty('createZodFieldValidator');
  });

  it('publishes framework-neutral structural contracts', () => {
    expectTypeOf<ZodSchemaLike<{ email: string }>['safeParseAsync']>().toBeFunction();
    expectTypeOf<ZodAdapterOptions['errorMode']>().toEqualTypeOf<'first' | 'all' | undefined>();
  });
});
