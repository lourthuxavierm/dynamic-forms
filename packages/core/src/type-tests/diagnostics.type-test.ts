import {
  DataSourceManager,
  FormRuntime,
  explainCondition,
  type ConditionRuleExplanation,
  type DataSourceRequestPhase,
  type FieldFlagReason,
  type FieldStateExplanation,
  type RuntimeDiagnosticEvent,
  type RuntimeDiagnostics,
} from '../index';

const runtime = new FormRuntime({ id: 'diagnostics-types', fields: [{ name: 'email', type: 'email' }] }, { email: '' }, {
  diagnostics: { enabled: true, includeValues: false, limit: 50, onDiagnostic: (event: RuntimeDiagnosticEvent) => void event.sequence },
});

const diagnostics: RuntimeDiagnostics = runtime.diagnostics;
const explanation: FieldStateExplanation = runtime.explainFieldState('email', { includeValues: true });
const reason: FieldFlagReason = explanation.visible.reason;
const rules: readonly string[] = explanation.validation.rules;
void reason; void rules;

for (const event of diagnostics.getTrace({ type: ['conditionChange', 'dependencyRefresh'] })) {
  // The discriminant narrows each trace entry.
  if (event.type === 'conditionChange') { const visible: boolean = event.state.visible; void visible; }
  if (event.type === 'dependencyRefresh') { const action: 'reset' | 'dataSource' = event.action; void action; }
  // @ts-expect-error validation diagnostics do not carry a path
  if (event.type === 'validation') void event.path;
}

// @ts-expect-error unknown trace event types are rejected
diagnostics.getTrace({ type: 'unknown' });

const decisive: readonly ConditionRuleExplanation[] = explainCondition({ field: 'email', operator: 'exists' }, {}).decisive;
void decisive;

const manager = new DataSourceManager({ onRequest: (event) => { const phase: DataSourceRequestPhase = event.phase; void phase; } });
void manager;

// @ts-expect-error explainFieldState is read-only diagnostics, not a mutation API
runtime.explainFieldState('email').visible.value = false;
