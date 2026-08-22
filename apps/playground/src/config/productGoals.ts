export type ProductGoalPriority = 'P0' | 'P1' | 'P2';
export type ProductGoalStatus = 'not-started' | 'in-progress' | 'verified';

export interface ProductGoal {
  id: string;
  priority: ProductGoalPriority;
  title: string;
  status: ProductGoalStatus;
  acceptanceCriteria: readonly string[];
  evidence: readonly string[];
}

/** Machine-readable release goals. Only reproducible evidence permits `verified`. */
export const productGoals = [
  {
    id: 'stable-coverage', priority: 'P0', title: 'Demonstrate every stable package and control', status: 'in-progress',
    acceptanceCriteria: ['Every implemented package has a runnable example.', 'Every default MUI registry type is reachable from the field catalogue.', 'Schema-only and placeholder capabilities are labelled accurately.'],
    evidence: ['Complete form in App.tsx', 'Canonical quickstart example'],
  },
  {
    id: 'runtime-inspection', priority: 'P0', title: 'Expose schema, state, rules, events, and performance', status: 'in-progress',
    acceptanceCriteria: ['Each demo exposes schema and redacted runtime state.', 'Applicable demos expose event, rule, dependency, and request traces.', 'Measurements have documented units and budgets.'],
    evidence: ['Inspector component boundaries are scaffolded'],
  },
  {
    id: 'executable-examples', priority: 'P0', title: 'Keep every demo runnable, editable, and copyable', status: 'in-progress',
    acceptanceCriteria: ['Displayed source is imported from the runnable example.', 'Edits are schema-validated and never execute arbitrary code.', 'Copy actions include all imports and compile against public exports.'],
    evidence: ['Documentation and playground share QuickstartExample.tsx'],
  },
  {
    id: 'enterprise-workflows', priority: 'P0', title: 'Use realistic enterprise workflows', status: 'in-progress',
    acceptanceCriteria: ['At least one end-to-end workflow includes async, conditional, and submission behavior.', 'Expected behavior, failure modes, and security boundaries are explicit.'],
    evidence: ['Enterprise example schema is scaffolded'],
  },
  {
    id: 'responsive', priority: 'P0', title: 'Work on desktop, tablet, and mobile', status: 'in-progress',
    acceptanceCriteria: ['Primary workflows are usable at desktop, tablet, and mobile widths.', 'Automated viewport smoke tests and keyboard checks pass.'],
    evidence: ['Quickstart uses responsive MUI spacing'],
  },
  {
    id: 'share-and-preferences', priority: 'P1', title: 'Support shareable URLs and persisted preferences', status: 'in-progress',
    acceptanceCriteria: ['Every demo has a stable deep link.', 'Only non-sensitive UI preferences are persisted.', 'Invalid or oversized shared state fails safely.'],
    evidence: ['Quickstart has a stable query-string entry point'],
  },
  {
    id: 'integration-test-application', priority: 'P1', title: 'Double as an integration-test application', status: 'in-progress',
    acceptanceCriteria: ['Critical workflows run in CI against public package exports.', 'Stable demos produce no unexpected console errors or warnings.'],
    evidence: ['Quickstart validation and submission run in Chromium CI'],
  },
] as const satisfies readonly ProductGoal[];
