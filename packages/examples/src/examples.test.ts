import { describe, expect, it } from 'vitest';
import { evaluateCondition, validateSchema } from '@dynamic-forms/core';
import { basicFormSchema } from './basic';
import { approvalCondition, conditionalSchema } from './conditions';
import { createLocationDependencyGraph } from './dependencies';
import { validationSchema } from './validation';
import { getActiveWizardSteps, validateWizardStep, wizardInitialValues } from './wizard';

describe('shared examples', () => {
  it.each([basicFormSchema, validationSchema, conditionalSchema])('provides a valid schema: $id', (schema) => {
    expect(validateSchema(schema)).toMatchObject({ valid: true, errors: [] });
  });
  it('keeps conditions deterministic', () => {
    expect(evaluateCondition(approvalCondition, { employmentType: 'employee', profile: { region: 'EU' } })).toBe(true);
    expect(evaluateCondition(approvalCondition, { employmentType: 'contractor', profile: { region: 'EU' } })).toBe(false);
  });
  it('creates isolated dependency graphs', () => {
    expect(createLocationDependencyGraph().getTransitiveDependents('country')).toEqual(['state', 'city']);
  });
  it('validates and filters wizard steps', () => {
    expect(getActiveWizardSteps(wizardInitialValues).map(({ id }) => id)).not.toContain('company');
    expect(validateWizardStep('personal', wizardInitialValues)).toHaveProperty('fullName');
  });
});
