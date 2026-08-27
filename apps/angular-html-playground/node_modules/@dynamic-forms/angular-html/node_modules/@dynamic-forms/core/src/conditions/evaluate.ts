import { getByPath } from '../store';
import type { Condition, FieldCondition } from './types';

export function evaluateCondition(condition: FieldCondition, values: Record<string, unknown>): boolean {
  if ('field' in condition) return evaluateRule(condition, values);

  const andMatches = !condition.and || condition.and.every((item) => evaluateCondition(item, values));
  const orMatches = !condition.or || condition.or.some((item) => evaluateCondition(item, values));
  const notMatches = !condition.not || !evaluateCondition(condition.not, values);
  return andMatches && orMatches && notMatches;
}

function evaluateRule(condition: Condition, values: Record<string, unknown>): boolean {
  const actual = getByPath(values, condition.field);
  switch (condition.operator) {
    case 'equals': return actual === condition.value;
    case 'notEquals': return actual !== condition.value;
    case 'exists': return actual !== undefined && actual !== null;
    case 'notExists': return actual === undefined || actual === null;
    case 'contains': return Array.isArray(actual) ? actual.includes(condition.value) : typeof actual === 'string' ? actual.includes(String(condition.value)) : false;
    case 'greaterThan': return Number(actual) > Number(condition.value);
    case 'lessThan': return Number(actual) < Number(condition.value);
  }
}
