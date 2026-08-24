import { approvalCondition } from '@dynamic-forms/examples/conditions';
export const ruleUnitExamples = `describe('approvalCondition', () => {
  it('passes for an EU employee', () => expect(evaluateCondition(approvalCondition, { employmentType: 'employee', profile: { region: 'EU' } })).toBe(true));
  it('fails for a non-certified US employee', () => expect(evaluateCondition(approvalCondition, { employmentType: 'employee', profile: { region: 'US' }, team: [{ certified: false }] })).toBe(false));
});`;
export const conditionalSource = `// Conditions are data, never executable strings.\nconst visibleWhen = ${JSON.stringify(approvalCondition, null, 2)};\nconst passed = evaluateCondition(visibleWhen, values);`;
