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

export interface ConditionGroup {
  and?: readonly FieldCondition[];
  or?: readonly FieldCondition[];
  not?: FieldCondition;
}

export type FieldCondition = Condition | ConditionGroup;
