import { evaluateCondition, type FieldCondition, type FormSchema } from '@dynamic-form-engine/core';

export const approvalCondition: FieldCondition = { and: [{ field: 'employmentType', operator: 'equals', value: 'employee' }, { or: [{ field: 'profile.region', operator: 'equals', value: 'EU' }, { field: 'team.0.certified', operator: 'equals', value: true }] }] };
export const conditionalSchema: FormSchema = { id: 'business-rules', version: '1.0.0', fields: [
  { name: 'role', type: 'select', label: 'Active role', options: [{ label: 'Admin', value: 'admin' }, { label: 'Editor', value: 'editor' }, { label: 'Viewer', value: 'viewer' }] },
  { name: 'employmentType', type: 'select', label: 'Employment type', options: [{ label: 'Employee', value: 'employee' }, { label: 'Contractor', value: 'contractor' }] },
  { name: 'profile', type: 'object', fields: [{ name: 'region', type: 'select', label: 'Profile region', options: [{ label: 'European Union', value: 'EU' }, { label: 'United States', value: 'US' }] }] },
  { name: 'team', type: 'array', fields: [{ name: 'certified', type: 'checkbox', label: 'First team member certified' }] },
  { name: 'managerNotes', type: 'textarea', label: 'Manager notes', visibleWhen: approvalCondition },
  { name: 'adminCode', type: 'text', label: 'Admin approval code', requiredWhen: { field: 'role', operator: 'equals', value: 'admin' } },
  { name: 'editorComment', type: 'text', label: 'Editor comment', disabledWhen: { field: 'role', operator: 'equals', value: 'viewer' } },
  { name: 'auditReference', type: 'text', label: 'Audit reference', readOnlyWhen: { field: 'role', operator: 'notEquals', value: 'admin' } },
  { name: 'salary', type: 'number', label: 'Base salary', config: { min: 0 } },
  { name: 'bonusRate', type: 'percentage', label: 'Bonus rate', config: { min: 0, max: 100 } },
  { name: 'totalCompensation', type: 'currency', label: 'Calculated total compensation', readOnly: true, config: { currency: 'USD' } },
] };
export const conditionalInitialValues = { role: 'editor', employmentType: 'employee', profile: { region: 'US' }, team: [{ certified: false }], managerNotes: '', adminCode: '', editorComment: '', auditReference: 'AUD-2026-009', salary: 100000, bonusRate: 10, totalCompensation: 110000 };

export function explainCondition(condition: FieldCondition, values: Record<string, unknown>): string[] {
  if ('field' in condition) return [`${condition.field} ${condition.operator}${condition.value === undefined ? '' : ` ${JSON.stringify(condition.value)}`} -> ${evaluateCondition(condition, values) ? 'PASS' : 'FAIL'}`];
  return [...(condition.and ? [`AND group -> ${evaluateCondition({ and: condition.and }, values) ? 'PASS' : 'FAIL'}`, ...condition.and.flatMap((item) => explainCondition(item, values))] : []), ...(condition.or ? [`OR group -> ${evaluateCondition({ or: condition.or }, values) ? 'PASS' : 'FAIL'}`, ...condition.or.flatMap((item) => explainCondition(item, values))] : []), ...(condition.not ? [`NOT group -> ${evaluateCondition({ not: condition.not }, values) ? 'PASS' : 'FAIL'}`, ...explainCondition(condition.not, values)] : [])];
}
