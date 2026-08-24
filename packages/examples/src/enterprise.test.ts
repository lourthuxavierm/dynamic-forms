import { describe, expect, it } from 'vitest';
import { adminConfigurationInitialValues, calculateFinancedAmount, loanApplicationInitialValues, onboardingCities, onboardingStates, redactAdminConfiguration, requiresSeniorApproval } from './enterprise';

describe('shared enterprise workflows', () => {
  it('provides consistent cascading location fixtures', () => {
    expect(onboardingStates.IN).toContain('Tamil Nadu');
    expect(onboardingCities['Tamil Nadu']).toContain('Chennai');
  });
  it('calculates approval thresholds deterministically', () => {
    const financed = calculateFinancedAmount(loanApplicationInitialValues);
    expect(financed).toBe(400000);
    expect(requiresSeniorApproval(financed)).toBe(true);
  });
  it('redacts admin secrets without mutating the input', () => {
    expect(redactAdminConfiguration(adminConfigurationInitialValues).token).toBe('[REDACTED]');
    expect(adminConfigurationInitialValues.token).toBe('secret-token');
  });
});
