# Dynamic Form Engine — Core Design 10/10 Roadmap

## Goal

Upgrade `@dynamic-form-engine/core` from the current strong architecture to a production-grade, enterprise-ready **10/10 Core design** without unnecessarily expanding feature scope.

> **Primary principle:** Improve contracts, type safety, determinism, performance, observability, and reliability before adding more controls or adapters.

---

## Progress Tracker

| # | Area | Priority | Status | Target |
|---|---|---|---|---|
| 1 | Strong Public Type Safety | P0 | [x] | No unnecessary public `any` |
| 2 | Typed Path System | P0 | [x] | Compile-time safe nested paths/values |
| 3 | Selector-Based Subscriptions | P1 | [x] | Fine-grained state subscriptions |
| 4 | Transactions / Batch Updates | P0 | [x] | One atomic update/notification cycle |
| 5 | Async Race & Cancellation Management | P0 | [x] | Stale-safe async operations |
| 6 | Unified Runtime Lifecycle | P0 | [x] | Deterministic processing pipeline |
| 7 | Plugin / Middleware Contract | P1 | [x] | Stable Core extension API |
| 8 | Performance Guarantees | P1 | [ ] | Benchmarked large-form performance |
| 9 | Schema Normalization & Versioning | P1 | [ ] | Canonical/versioned schema runtime |
| 10 | Diagnostics & Explainability | P1 | [ ] | Core can explain runtime decisions |

---

# 1. Strong Public Type Safety

**Priority:** P0 — Critical

### Current problem

Public Core APIs still expose broad types such as `any` in areas including field values, registry definitions, and path utilities.

### Required work

- [x] Replace `FieldValue = any` with a strongly typed field-value model.
- [x] Create a standard `FieldValueMap`.
- [x] Preserve custom field extensibility through generics.
- [x] Replace unnecessary public `any` with `unknown` or precise generics.
- [x] Strongly type `FieldRegistry`.
- [x] Strongly type field definitions.
- [x] Strongly type validation values.
- [x] Strongly type event payloads.
- [x] Add compile-time type tests.
- [x] Enable `@typescript-eslint/no-explicit-any` incrementally.

### Target example

```ts
interface FieldValueMap {
  text: string;
  textarea: string;
  email: string;
  password: string;
  number: number | null;
  checkbox: boolean;
  select: string | number | null;
  'multi-select': Array<string | number>;
  date: string | null;
  object: Record<string, unknown>;
  array: unknown[];
}
```

### Done when

- Public Core APIs do not depend on broad `any` fallbacks for normal use.
- Custom controls remain extensible.
- TypeScript autocomplete remains strong for built-in controls.

---

# 2. Typed Path System

**Priority:** P0 — Critical

### Goal

Make nested form paths and their values compile-time safe.

### Required work

- [x] Introduce `Path<TValues>`.
- [x] Introduce `PathValue<TValues, TPath>`.
- [x] Type `getValue()`.
- [x] Type `setValue()`.
- [x] Type `resetField()`.
- [x] Type `setError()` and field errors where practical.
- [x] Support nested objects.
- [x] Support array paths.
- [x] Support array indices.
- [x] Keep an escape hatch for dynamic runtime schemas.
- [x] Add type-level regression tests.

### Target behavior

```ts
interface CustomerForm {
  name: string;
  age: number;
  address: {
    city: string;
  };
}

store.setValue('name', 'Xavier'); // valid
store.setValue('age', 24); // valid
store.setValue('address.city', 'Chennai'); // valid
store.setValue('age', 'wrong'); // TypeScript error
```

### Done when

Invalid path/value combinations are caught during development wherever the schema/value type is known statically.

---

# 3. Selector-Based Subscriptions

**Priority:** P1 — High

### Goal

Move beyond field-targeted notifications toward precise state-slice subscriptions.

### Required work

- [x] Keep existing `subscribe()` behavior for compatibility.
- [x] Keep `subscribeToField()` where useful.
- [x] Add selector subscriptions.
- [x] Add configurable equality comparison.
- [x] Support value-only subscriptions.
- [x] Support error-only subscriptions.
- [x] Support touched/dirty subscriptions.
- [x] Support condition-state subscriptions.
- [x] Prevent unrelated state changes from notifying subscribers.
- [x] Add render/subscription performance tests.

### Possible API

```ts
store.subscribeSelector(
  state => state.values.customer?.name,
  value => {
    console.log(value);
  }
);
```

### Done when

Large forms can update individual state slices without unnecessary consumer updates.

---

# 4. Transactions / Batch Updates

**Priority:** P0 — Critical

### Goal

Allow multiple related mutations to become one deterministic state transition.

### Required work

- [x] Add `batch()` or transaction API.
- [x] Suppress intermediate notifications inside a batch.
- [x] Consolidate field notifications.
- [x] Consolidate form notifications.
- [x] Define event behavior during transactions.
- [x] Ensure validation can run once after a batch.
- [x] Ensure conditions can settle before notification.
- [x] Ensure dependency chains can settle before notification.
- [x] Support nested transactions safely.
- [x] Add rollback strategy only if genuinely required.

### Example

```ts
store.batch(() => {
  store.setValue('country', 'IN');
  store.setValue('state', null);
  store.setValue('city', null);
});
```

### Done when

A multi-field business operation can complete atomically without exposing inconsistent intermediate form state.

---

# 5. Async Race & Cancellation Management

**Priority:** P0 — Critical

### Goal

Make all asynchronous Core operations stale-safe.

### Applies to

- Data sources
- Search/autocomplete
- Dependency refreshes
- Async validation
- Remote options
- Future async plugins

### Required work

- [x] Standardize `AbortSignal` support.
- [x] Add request generation/request IDs.
- [x] Ignore stale responses.
- [x] Implement last-write-wins semantics where appropriate.
- [x] Cancel superseded requests.
- [x] Centralize async error handling.
- [x] Track loading state consistently.
- [x] Track async errors consistently.
- [x] Define behavior when fields are removed/hidden while requests are active.
- [x] Add race-condition regression tests.
- [x] Add rapid-input/search tests.
- [x] Add dependency-chain cancellation tests.

### Done when

An older request can never overwrite newer user state.

---

# 6. Unified Runtime Lifecycle

**Priority:** P0 — Critical

### Goal

Define one deterministic Core processing lifecycle.

### Proposed conceptual pipeline

```text
User/API mutation
      ↓
State mutation
      ↓
Dependency evaluation
      ↓
Condition evaluation
      ↓
Data-source effects
      ↓
Validation
      ↓
Events
      ↓
Subscriber notification
```

> Final ordering should be selected based on actual Core semantics and documented as a stable contract.

### Required work

- [x] Define lifecycle phases.
- [x] Define ordering guarantees.
- [x] Define sync vs async phases.
- [x] Define batching behavior.
- [x] Define condition/dependency interaction.
- [x] Define validation timing.
- [x] Define event timing.
- [x] Prevent recursive/infinite dependency loops.
- [x] Detect dependency cycles.
- [x] Add lifecycle integration tests.
- [x] Document lifecycle contract publicly.

### Done when

The same input sequence always produces the same state transitions and event order.

---

# 7. Plugin / Middleware Contract

**Priority:** P1 — High

### Goal

Provide a stable extension mechanism without requiring consumers to modify Core.

### Possible use cases

- Analytics
- Audit logging
- Autosave
- Persistence
- Custom validation
- Telemetry
- Value transformation
- Workflow integration
- Custom dependency behavior
- DevTools

### Required work

- [x] Define `CorePlugin` interface.
- [x] Define plugin lifecycle hooks.
- [x] Define plugin initialization/disposal.
- [x] Define plugin ordering.
- [x] Define error isolation.
- [x] Prevent plugins from corrupting internal state.
- [x] Provide read-only runtime context where possible.
- [x] Define optional middleware/interceptor semantics.
- [x] Add plugin tests.
- [x] Add one official example plugin.

### Important

Do not create a huge plugin framework for v1. Keep the contract small, stable, and composable.

---

# 8. Performance Guarantees

**Priority:** P1 — High

### Goal

Prove Core performance instead of assuming it.

### Benchmark scenarios

- [ ] 100 fields.
- [ ] 500 fields.
- [ ] 1,000 fields.
- [ ] 5,000 fields as a stress test.
- [ ] Deep nested objects.
- [ ] Large field arrays.
- [ ] 100+ conditional fields.
- [ ] Long dependency chains.
- [ ] Repeated `setValue()` operations.
- [ ] Batch updates.
- [ ] Validation-heavy forms.
- [ ] Rapid async datasource requests.
- [ ] Reset large forms.
- [ ] Snapshot/clone/freeze cost.

### Measure

- Mutation latency
- Validation latency
- Condition evaluation latency
- Dependency processing latency
- Subscriber notification count
- Memory consumption
- Reset cost
- Initialization cost

### Performance budget

Define measurable performance targets before stable `1.0.0`.

### Done when

Core has repeatable benchmark results and known performance characteristics for realistic large forms.

---

# 9. Schema Normalization & Versioning

**Priority:** P1 — High

### Goal

Separate the flexible public schema from a predictable internal runtime representation.

### Required work

- [ ] Introduce schema normalization.
- [ ] Normalize defaults.
- [ ] Normalize validation definitions.
- [ ] Normalize conditions.
- [ ] Normalize dependencies.
- [ ] Normalize data sources.
- [ ] Validate duplicate field names.
- [ ] Validate invalid references.
- [ ] Detect dependency cycles.
- [ ] Produce useful schema diagnostics.
- [ ] Introduce `schemaVersion` if appropriate.
- [ ] Define future schema migration mechanism.
- [ ] Keep normalization framework-independent.

### Example

```ts
const schema: FormSchema = {
  schemaVersion: 1,
  id: 'customer-form',
  fields: []
};
```

### Done when

Core operates on a canonical internal schema and future schema evolution can occur without uncontrolled breaking changes.

---

# 10. Diagnostics & Explainability

**Priority:** P1 — High

### Goal

Allow developers and future DevTools to understand why Core reached a particular state.

### Questions Core should be able to answer

- [ ] Why is this field hidden?
- [ ] Why is this field disabled?
- [ ] Why is this field readonly?
- [ ] Why is this field required?
- [ ] Which condition evaluated to false?
- [ ] Which dependency caused this refresh?
- [ ] Which validator produced this error?
- [ ] Which datasource request is active?
- [ ] Was a datasource response discarded as stale?
- [ ] Which event caused this state transition?

### Possible diagnostics API

```ts
core.explainField('companyName');
```

Possible result:

```ts
{
  visible: false,
  reason: 'visibleWhen',
  dependency: 'customerType',
  expected: 'business',
  actual: 'individual'
}
```

### Required work

- [ ] Define diagnostic event structure.
- [ ] Keep diagnostics optional/low-overhead.
- [ ] Add condition explanations.
- [ ] Add dependency explanations.
- [ ] Add validation source metadata.
- [ ] Add datasource request metadata.
- [ ] Expose hooks needed by DevTools.
- [ ] Avoid leaking sensitive field values into logs by default.

### Done when

A developer can diagnose complex form behavior without stepping through Core internals.

---

# Cross-Cutting 1.0 Requirements

These requirements apply across all ten areas.

## API Stability

- [ ] Freeze stable Core public exports.
- [ ] Mark experimental APIs explicitly.
- [ ] Define deprecation policy.
- [ ] Define semantic-versioning policy.
- [ ] Validate packed npm exports.
- [ ] Add public API regression tests.

## Testing

- [ ] Unit tests for every Core subsystem.
- [x] Integration tests across subsystems.
- [ ] Nested object tests.
- [ ] Nested array tests.
- [x] Async race tests.
- [x] Lifecycle-order tests.
- [x] Batch/transaction tests.
- [ ] Type-level tests.
- [ ] Performance benchmarks.
- [ ] Memory/disposal tests where applicable.

## Documentation

- [ ] Core architecture.
- [x] Runtime lifecycle.
- [ ] Store contract.
- [ ] Schema contract.
- [ ] Conditions.
- [ ] Dependencies.
- [ ] Data sources.
- [ ] Validation contract.
- [ ] Events.
- [x] Plugins.
- [x] Async behavior.
- [ ] Performance guidance.
- [ ] Migration/versioning policy.

---

# Recommended Implementation Order

## Phase 1 — Core Safety

- [x] Strong public type safety.
- [x] Typed paths.
- [x] Transactions/batching.
- [x] Async race/cancellation management.

**Target Core score: ~9/10**

## Phase 2 — Runtime Architecture

- [x] Unified lifecycle.
- [x] Selector subscriptions.
- [ ] Schema normalization/versioning.

**Target Core score: ~9.5/10**

## Phase 3 — Enterprise Hardening

- [ ] Diagnostics/explainability.
- [ ] Performance benchmarks and budgets.
- [x] Small stable plugin contract.
- [ ] Complete regression/documentation pass.

**Target Core score: 10/10**

---

# Definition of 10/10 Core

The Core can be considered complete for a stable enterprise-quality `1.0.0` when:

- [ ] Framework independent.
- [ ] Renderer independent.
- [ ] Strongly typed.
- [ ] Nested-path safe.
- [x] Deterministic.
- [x] Transaction-safe.
- [x] Async race-safe.
- [x] Extensible without modifying Core.
- [ ] Fine-grained and performant.
- [ ] Schema-version aware.
- [ ] Observable and diagnosable.
- [ ] Thoroughly tested.
- [ ] Benchmarked.
- [ ] Public API frozen/documented.
- [ ] No unnecessary framework dependencies.
- [ ] No unnecessary public `any` escape hatches.

---

# Scope Freeze — Do Not Prioritize Before Core 1.0

Unless required to fix a Core contract, avoid spending Core-stabilization time on:

- [ ] Additional visual controls.
- [ ] New UI libraries.
- [ ] Vue adapter.
- [ ] More Angular features beyond required parity fixes.
- [ ] Full JSON Schema implementation.
- [ ] Large DevTools UI.
- [ ] AI form generation.
- [ ] Workflow product features.
- [ ] Hosted platform features.

These can follow once the Core contract is stable.

---

## Final Target

```text
Current Core Design       ~8.0 / 10
After Phase 1             ~9.0 / 10
After Phase 2             ~9.5 / 10
After Phase 3             10.0 / 10
```

**Core 1.0 principle:** Stability over feature count. A smaller deterministic, typed, race-safe, benchmarked Core is more valuable than a larger Core with unstable contracts.
