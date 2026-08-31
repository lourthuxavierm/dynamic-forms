import { describe, expect, it } from 'vitest';
import { RHF_ADAPTER_CONTRACT } from './index';

describe('RHF adapter contract', () => {
  it('declares React Hook Form as the sole runtime state owner', () => {
    expect(RHF_ADAPTER_CONTRACT).toEqual({
      stateOwner: 'react-hook-form',
      schemaOwner: '@dynamic-form-engine/core',
      renderer: 'consumer',
      defaultHiddenFieldPolicy: 'retain',
    });
  });

  it('is immutable at runtime', () => {
    expect(Object.isFrozen(RHF_ADAPTER_CONTRACT)).toBe(true);
  });
});
