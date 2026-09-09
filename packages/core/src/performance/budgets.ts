export interface CorePerformanceBudgets {
  initialize5000Ms: number;
  mutate1000FieldFormMs: number;
  batch100UpdatesMs: number;
  validate1000FieldsMs: number;
  evaluate100ConditionsMs: number;
  process100DependenciesMs: number;
  rapid100RequestsMs: number;
  reset5000FieldsMs: number;
  retained5000FieldsMb: number;
  batchNotificationCount: number;
}

/**
 * Conservative CI guardrails, not expected averages. Benchmark output should be
 * used for machine-specific comparisons and these limits catch major regressions.
 */
export const CORE_PERFORMANCE_BUDGETS: Readonly<CorePerformanceBudgets> = Object.freeze({
  initialize5000Ms: 2_000,
  mutate1000FieldFormMs: 1_000,
  batch100UpdatesMs: 3_000,
  validate1000FieldsMs: 2_000,
  evaluate100ConditionsMs: 1_000,
  process100DependenciesMs: 1_000,
  rapid100RequestsMs: 2_000,
  reset5000FieldsMs: 2_000,
  retained5000FieldsMb: 128,
  batchNotificationCount: 1,
});
