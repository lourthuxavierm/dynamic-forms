export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'exists'
  | 'notExists'
  | 'contains'
  | 'greaterThan'
  | 'lessThan';

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export type FieldCondition = Condition;
