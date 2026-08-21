import { describe, expect, it } from 'vitest';
import { FormProvider, useField, useFieldState } from '../index';

describe('React Phase 3 public validation API', () => {
  it('exports provider and validation-aware field hooks', () => {
    expect(FormProvider).toBeTypeOf('function');
    expect(useField).toBeTypeOf('function');
    expect(useFieldState).toBeTypeOf('function');
  });
});
