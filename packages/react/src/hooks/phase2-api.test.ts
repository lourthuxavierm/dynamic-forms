import { describe, expect, it } from 'vitest';
import * as reactAdapter from './index';

describe('React Phase 2 public hooks', () => {
  it('exports scoped state and action hooks', () => {
    expect(reactAdapter.useFieldState).toBeTypeOf('function');
    expect(reactAdapter.useFormState).toBeTypeOf('function');
    expect(reactAdapter.useFormActions).toBeTypeOf('function');
    expect(reactAdapter.useWatch).toBeTypeOf('function');
  });
});
