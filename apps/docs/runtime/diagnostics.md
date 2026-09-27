# Diagnostics and explainability

- Status: Documented
- Owner: Core maintainers
- Last verified: 2026-09-28
- Applies to: Core runtime 1.0.0-rc

`FormRuntime` can explain why a field is in its current state and, when
enabled, record a bounded trace of the transitions that led there. Diagnostics
are read-only: they never mutate form state.

## Explaining a field

`runtime.explainFieldState(path)` works at any time, with or without the trace.
It answers:

| Question | Where to look |
|---|---|
| Why is this field hidden, disabled, read-only, or required? | `visible`, `disabled`, `readOnly`, `required` → `reason` (`default`, `static`, `validation.required`, or the `*When` rule) |
| Which condition evaluated to false? | `<flag>.condition.decisive` — the leaf rules that decided the outcome, with `field`, `operator`, `expected` |
| Which validator produced this error? | `validation.source` (`schema` or `external`) and `validation.rule` (e.g. `minLength`) |
| Which rules are configured or currently failing? | `validation.rules`, `validation.failingRules` |
| Which datasource request is active? | `dataSource.activeRequestId`, `dataSource.status` |
| Was a response discarded as stale? | `dataSource.lastDiscarded` (trace required) |
| Which dependency caused this refresh? | `dependencies.lastRefresh.via` and `.cause` (trace required) |
| Which event caused this state transition? | `lastConditionChange.cause.sequence` points at the triggering trace entry (trace required) |

```ts verify
import { FormRuntime } from '@dynamic-form-engine/core';

const runtime = new FormRuntime({
  id: 'customer',
  fields: [
    { name: 'customerType', type: 'select' },
    { name: 'companyName', type: 'text', visibleWhen: { field: 'customerType', operator: 'equals', value: 'business' } },
  ],
}, { customerType: 'individual', companyName: '' });

const { visible } = runtime.explainFieldState('companyName');
// visible.value === false, visible.reason === 'visibleWhen'
// visible.condition?.decisive[0] → { field: 'customerType', operator: 'equals', expected: 'business', actualType: 'string' }
runtime.dispose();
```

`explainCondition(condition, values)` exposes the same evaluation for a
standalone condition. It uses exactly the semantics of `evaluateCondition`.

## Recording a trace

The trace is disabled by default. Enable it with
`FormRuntimeOptions.diagnostics` or later with `runtime.diagnostics.enable()`.

```ts
const runtime = new FormRuntime(schema, initialValues, {
  diagnostics: { enabled: true, limit: 200, onDiagnostic: (event) => devtools.send(event) },
});

runtime.diagnostics.getTrace({ path: 'companyName', type: 'conditionChange' });
const unsubscribe = runtime.diagnostics.subscribe((event) => inspect(event));
```

Each entry has a monotonic `sequence`. Entry types:

- `valueChange` — path, `origin` (`api` or `hiddenValuePolicy`), value types
- `reset`
- `conditionChange` — new and previous state, `changed` flags, `cause`, hidden-value policy
- `dependencyRefresh` — dependent path, `action` (`reset` or `dataSource`), `via`, `cause`
- `dataSourceRequest` — `requestId` and `phase`: `start`, `success`, `error`, `cancelled`, `stale`, `cache`
- `validation` — `valid` and `errorPaths`

A `cause` of `{ type: 'valueChange', path, sequence }` links a transition to
the value change that triggered it. The trace keeps the newest `limit`
entries (default 200). `clear()` empties it and `disable()` stops recording.

`DataSourceManagerOptions.onRequest` exposes the same request lifecycle for
consumers using `DataSourceManager` directly.

## Privacy and cost

- Field values are **not** recorded or included in explanations by default.
  Entries report value *types* (`actualType`, `valueType`). Opt in with
  `includeValues: true` on the runtime options or per `explainFieldState` call.
- Validation entries record which paths failed, never the messages.
- When the trace is disabled, each transition costs one boolean check.
- Diagnostic listeners are isolated: a throwing listener cannot interrupt
  Core; the error is rethrown asynchronously.

## Limits

`explainFieldState` re-derives reasons from the current schema and values. It
does not replay history; questions about *past* transitions need the trace.
Errors from custom validators, `setError`, or servers are reported as
`external` because Core stores only the message.
