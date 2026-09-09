# Core performance guarantees

This document defines the repeatable performance contract for `@dynamic-form-engine/core`. Results are engineering baselines, not universal latency promises: CPU, Node.js version, schema shape, plugins, validators, and datasource implementations affect application measurements.

## Commands

- `pnpm --filter @dynamic-form-engine/core bench` runs the complete benchmark matrix.
- `pnpm --filter @dynamic-form-engine/core bench:json` writes machine-readable Vitest results to `benchmark-results.json`.
- `pnpm --filter @dynamic-form-engine/core test` enforces conservative CI guardrails from `CORE_PERFORMANCE_BUDGETS`.

Benchmark files are outside the published package. Generated JSON results are ignored by Git so CI systems can upload them as artifacts.

## CI guardrails

| Operation | Maximum |
|---|---:|
| Initialize, clone, and freeze 5,000 fields | 2,000 ms |
| Mutate one field in a 1,000-field form | 1,000 ms |
| Batch 100 updates in a 1,000-field form | 3,000 ms |
| Validate 1,000 fields | 2,000 ms |
| Evaluate 100 conditions | 1,000 ms |
| Process a 100-field dependency chain | 1,000 ms |
| Issue 100 rapid datasource requests | 2,000 ms |
| Reset 5,000 fields | 2,000 ms |
| Retained heap for a 5,000-field store | 128 MB |
| Notifications for one batch | exactly 1 |

These limits intentionally leave headroom for shared CI runners. Benchmark means and percentiles should be used to spot smaller regressions during review.

## Baseline — 2026-09-10

Environment: Windows x64, Node.js 24.15.0, Intel Core i5-6300U 2.40 GHz (4 logical cores), 16 GB RAM. Vitest 4.1.11; each case used at least five measured iterations after warmup.

| Scenario | Mean | p99 |
|---|---:|---:|
| Initialize 100 fields | 0.05 ms | 0.16 ms |
| Initialize 500 fields | 0.20 ms | 0.74 ms |
| Initialize 1,000 fields | 0.38 ms | 1.19 ms |
| Initialize 5,000 fields | 11.01 ms | 17.11 ms |
| Deep nested object mutation | 0.03 ms | 0.10 ms |
| Update one row in a 1,000-row array | 2.49 ms | 4.15 ms |
| Evaluate 100 conditional fields | 0.28 ms | 1.01 ms |
| Process a 100-field dependency chain | 5.47 ms | 8.86 ms |
| 100 repeated updates in 1,000 fields | 36.69 ms | 37.82 ms |
| Batch 100 updates in 1,000 fields | 39.87 ms | 49.33 ms |
| Validate 1,000 required fields | 2.45 ms | 4.78 ms |
| Issue 100 rapid datasource searches | 7.50 ms | 9.39 ms |
| Reset 5,000 fields | 19.35 ms | 22.41 ms |

The current batch path optimizes consistency and notification count, not raw mutation throughput: it performs the same immutable state work as individual updates but emits one final notification. This is an explicit performance characteristic rather than an undocumented assumption.

## Coverage

The benchmark matrix covers 100, 500, 1,000, and 5,000-field forms; nested objects; large arrays; 100 conditional fields; a 100-field dependency chain; repeated mutations; batched mutations; validation-heavy forms; rapid stale-safe datasource requests; reset; initialization; cloning/freezing; notification counts; and retained heap.

For application profiling, measure end-to-end renderer work separately. Core benchmarks intentionally exclude React, Angular, network latency, and DOM rendering.
