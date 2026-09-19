import { describe, expect, it } from 'vitest';
import { ConditionController } from '../conditions';
import { DataSourceManager } from '../datasource';
import { DependencyController } from '../dependencies';
import type { FormSchema } from '../schema';
import { createFormValidator } from '../validation';
import { FormStore } from '../store';
import { CORE_PERFORMANCE_BUDGETS as budget } from './budgets';

describe('Core performance budgets', () => {
  it('keeps large-form initialization, mutation, reset, and retained memory within guardrails', () => {
    const values = createValues(5_000);
    const memoryUsage = (globalThis as unknown as { process: { memoryUsage(): { heapUsed: number } } }).process.memoryUsage;
    const beforeHeap = memoryUsage().heapUsed;
    let started = performance.now();
    const store = new FormStore(values);
    expect(performance.now() - started).toBeLessThan(budget.initialize5000Ms);
    const retainedMb = Math.max(0, memoryUsage().heapUsed - beforeHeap) / 1024 / 1024;
    expect(retainedMb).toBeLessThan(budget.retained5000FieldsMb);

    const medium = new FormStore(createValues(1_000));
    started = performance.now();
    medium.setValue('field500', 'updated');
    expect(performance.now() - started).toBeLessThan(budget.mutate1000FieldFormMs);

    started = performance.now();
    store.reset();
    expect(performance.now() - started).toBeLessThan(budget.reset5000FieldsMs);
  });

  it('keeps batches atomic and within the update budget', () => {
    const store = new FormStore(createValues(1_000));
    let notifications = 0;
    store.subscribe(() => { notifications += 1; });
    const started = performance.now();
    store.batch(() => {
      for (let index = 0; index < 100; index += 1) {
        store.setValue(`field${index}`, `updated-${index}`);
      }
    });

    expect(performance.now() - started).toBeLessThan(budget.batch100UpdatesMs);
    expect(notifications).toBe(budget.batchNotificationCount);
  });

  it('keeps validation, conditions, and dependency chains within guardrails', async () => {
    const validationSchema = createFlatSchema(1_000, true);
    const validationStore = new FormStore(createValues(1_000));
    let started = performance.now();
    await validationStore.validate(createFormValidator(validationSchema));
    expect(performance.now() - started).toBeLessThan(budget.validate1000FieldsMs);

    const conditionSchema = createConditionalSchema(100);
    const conditionStore = new FormStore({ toggle: false });
    const conditions = new ConditionController(conditionStore, conditionSchema);
    started = performance.now();
    conditionStore.setValue('toggle', true);
    expect(performance.now() - started).toBeLessThan(budget.evaluate100ConditionsMs);
    conditions.dispose();

    const dependencySchema = createDependencySchema(100);
    const dependencyStore = new FormStore(createDependencyValues(100));
    const dependencies = new DependencyController(dependencyStore, dependencySchema);
    started = performance.now();
    dependencyStore.setValue('field0', 'updated');
    expect(performance.now() - started).toBeLessThan(budget.process100DependenciesMs);
    dependencies.dispose();
  });

  it('keeps rapid stale-safe datasource requests within the request budget', async () => {
    const manager = new DataSourceManager();
    const started = performance.now();
    const requests = Array.from({ length: 100 }, (_, index) =>
      manager.loadConfig(
        'search',
        { type: 'function', load: async () => [index] },
        { values: {} },
        { search: String(index) },
      ));
    await Promise.all(requests);

    expect(performance.now() - started).toBeLessThan(budget.rapid100RequestsMs);
    expect(manager.getState<number>('search')).toMatchObject({ data: [99], status: 'success' });
  });
});

function createValues(count: number): Record<string, string> {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => [`field${index}`, `value-${index}`]));
}

function createFlatSchema(count: number, required = false): FormSchema {
  return {
    id: `flat-${count}`,
    fields: Array.from({ length: count }, (_, index) => ({
      name: `field${index}`,
      type: 'text' as const,
      validation: required ? { required: true } : undefined,
    })),
  };
}

function createConditionalSchema(count: number): FormSchema {
  return {
    id: 'conditions',
    fields: [
      { name: 'toggle', type: 'checkbox' },
      ...Array.from({ length: count }, (_, index) => ({
        name: `conditional${index}`,
        type: 'text' as const,
        visibleWhen: { field: 'toggle', operator: 'equals' as const, value: true },
      })),
    ],
  };
}

function createDependencySchema(count: number): FormSchema {
  return {
    id: 'dependencies',
    fields: Array.from({ length: count }, (_, index) => ({
      name: `field${index}`,
      type: 'text' as const,
      dependsOn: index === 0 ? undefined : [`field${index - 1}`],
      resetOnDependencyChange: index > 0,
    })),
  };
}

function createDependencyValues(count: number): Record<string, string> {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => [`field${index}`, 'initial']));
}
