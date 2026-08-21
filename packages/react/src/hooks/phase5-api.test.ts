import { describe, expect, it } from 'vitest';
import { useDataSource } from '../index';

describe('React Phase 5 public API', () => {
  it('exports the data-source hook', () => {
    expect(useDataSource).toBeTypeOf('function');
  });
});
