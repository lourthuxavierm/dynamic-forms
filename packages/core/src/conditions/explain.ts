import { dynamicPath, getByPath } from '../store';
import type { Condition, ConditionOperator, FieldCondition } from './types';
import { evaluateCondition } from './evaluate';

/** Runtime type of a value, reported instead of the value itself when values are redacted. */
export type DiagnosticValueType = 'undefined' | 'null' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'bigint' | 'symbol' | 'function';

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ExplainConditionOptions {
  /**
   * Include the actual field values read while evaluating. Defaults to `false`
   * so explanations can be logged without leaking user input.
   */
  includeValues?: boolean;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ConditionRuleExplanation {
  readonly kind: 'rule';
  readonly result: boolean;
  /** The field the rule reads (its dependency). */
  readonly field: string;
  readonly operator: ConditionOperator;
  /** The value configured in the schema. */
  readonly expected?: unknown;
  /** Present only when `includeValues` is enabled. */
  readonly actual?: unknown;
  readonly actualType: DiagnosticValueType;
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ConditionGroupExplanation {
  readonly kind: 'and' | 'or' | 'not' | 'group';
  readonly result: boolean;
  readonly children: readonly ConditionExplanation[];
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export type ConditionExplanation = ConditionRuleExplanation | ConditionGroupExplanation;

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export interface ConditionExplanationResult {
  readonly result: boolean;
  readonly explanation: ConditionExplanation;
  /**
   * The leaf rules that decided the outcome. For a `false` result these are the
   * rules that failed; for a `true` result, the rules that satisfied it.
   */
  readonly decisive: readonly ConditionRuleExplanation[];
}

/**
 * Evaluates a condition with the same semantics as `evaluateCondition` and
 * reports how each rule contributed to the result.
 *
 * @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md.
 */
export function explainCondition(condition: FieldCondition, values: object, options: ExplainConditionOptions = {}): ConditionExplanationResult {
  const explanation = explainNode(condition, values, options.includeValues === true);
  return Object.freeze({
    result: explanation.result,
    explanation,
    decisive: Object.freeze(collectDecisive(explanation)),
  });
}

/** @experimental Diagnostics contract (introduced in 1.0.0-rc). May change in a minor release; see STABILITY.md. */
export function describeValueType(value: unknown): DiagnosticValueType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function explainNode(condition: FieldCondition, values: object, includeValues: boolean): ConditionExplanation {
  if ('field' in condition) return explainRule(condition, values, includeValues);

  const parts: Array<{ kind: 'and' | 'or' | 'not'; node: ConditionExplanation }> = [];
  if (condition.and) parts.push({ kind: 'and', node: group('and', condition.and.map((item) => explainNode(item, values, includeValues))) });
  if (condition.or) parts.push({ kind: 'or', node: group('or', condition.or.map((item) => explainNode(item, values, includeValues))) });
  if (condition.not) {
    const child = explainNode(condition.not, values, includeValues);
    parts.push({ kind: 'not', node: Object.freeze({ kind: 'not', result: !child.result, children: Object.freeze([child]) }) });
  }
  // A group with a single operator is reported as that operator; combined
  // operators are wrapped in an implicit AND, matching evaluateCondition.
  if (parts.length === 1) return parts[0].node;
  const children = parts.map((part) => part.node);
  return Object.freeze({ kind: 'group', result: children.every((child) => child.result), children: Object.freeze(children) });
}

function group(kind: 'and' | 'or', children: ConditionExplanation[]): ConditionGroupExplanation {
  const result = kind === 'and' ? children.every((child) => child.result) : children.some((child) => child.result);
  return Object.freeze({ kind, result, children: Object.freeze(children) });
}

function explainRule(rule: Condition, values: object, includeValues: boolean): ConditionRuleExplanation {
  const actual = getByPath(values, dynamicPath(rule.field));
  return Object.freeze({
    kind: 'rule',
    result: evaluateCondition(rule, values),
    field: rule.field,
    operator: rule.operator,
    ...('value' in rule ? { expected: rule.value } : {}),
    ...(includeValues ? { actual } : {}),
    actualType: describeValueType(actual),
  });
}

function collectDecisive(node: ConditionExplanation): ConditionRuleExplanation[] {
  if (node.kind === 'rule') return [node];
  if (node.kind === 'not') return collectDecisive(node.children[0]);
  // AND-like groups fail because of their failing children; OR groups pass
  // because of their passing children. Otherwise every child contributed.
  const andLike = node.kind === 'and' || node.kind === 'group';
  const contributing = andLike
    ? (node.result ? node.children : node.children.filter((child) => !child.result))
    : (node.result ? node.children.filter((child) => child.result) : node.children);
  return contributing.flatMap(collectDecisive);
}
