import { bench, describe } from 'vitest';
import {
  ConditionController,
  DataSourceManager,
  DependencyController,
  FormStore,
  createFormValidator,
  compileSchemaOrThrow,
  type FormSchema,
} from '../src/index';

describe('form size and snapshots', () => {
  for (const count of [100, 500, 1_000, 5_000]) {
    const values = createValues(count);
    bench(`initialize, clone, and freeze ${count} fields`, () => {
      new FormStore(values);
    }, options);
  }
});

describe('nested values and field arrays', () => {
  bench('mutate a deep nested object', () => {
    const store = new FormStore({ level1: { level2: { level3: { value: '' } } } });
    store.setValue('level1.level2.level3.value', 'updated');
  }, options);

  bench('mutate one item in a 1000-row field array', () => {
    const store = new FormStore({ rows: Array.from({ length: 1_000 }, (_, index) => ({ value: index })) });
    store.setValue('rows[500].value', 501);
  }, options);
});

describe('conditions and dependencies', () => {
  const conditionSchema = createConditionalSchema(100);
  bench('evaluate 100 conditional fields', () => {
    const store = new FormStore({ toggle: false });
    const controller = new ConditionController(store, conditionSchema);
    store.setValue('toggle', true);
    controller.dispose();
  }, options);

  const dependencySchema = createDependencySchema(100);
  bench('process a 100-field dependency chain', () => {
    const store = new FormStore(createDependencyValues(100));
    const controller = new DependencyController(store, dependencySchema);
    store.setValue('field0', 'updated');
    controller.dispose();
  }, options);
});

describe('schema compilation and compiled lookup', () => {
  for (const count of [100, 500, 1_000, 5_000]) {
    const schema = createFlatSchema(count);
    bench(`compile ${count} fields`, () => {
      compileSchemaOrThrow(schema);
    }, options);
  }

  const compiled = compileSchemaOrThrow(createFlatSchema(5_000));
  bench('lookup one field in a 5000-field compiled index', () => {
    compiled.fieldsByPath.get('field4999');
  }, options);

  const rawFields = createFlatSchema(5_000).fields;
  bench('scan 5000 raw fields for one field', () => {
    rawFields.find((field) => field.name === 'field4999');
  }, options);
});

describe('mutation, batch, validation, datasource, and reset', () => {
  bench('100 repeated updates in a 1000-field form', () => {
    const store = new FormStore(createValues(1_000));
    for (let index = 0; index < 100; index += 1) store.setValue(`field${index}`, 'updated');
  }, options);

  bench('batch 100 updates in a 1000-field form', () => {
    const store = new FormStore(createValues(1_000));
    store.batch(() => {
      for (let index = 0; index < 100; index += 1) store.setValue(`field${index}`, 'updated');
    });
  }, options);

  const validationSchema = createFlatSchema(1_000, true);
  bench('validate 1000 required fields', async () => {
    const store = new FormStore(createValues(1_000));
    await store.validate(createFormValidator(validationSchema));
  }, options);

  bench('issue 100 rapid datasource searches', async () => {
    const manager = new DataSourceManager();
    await Promise.all(Array.from({ length: 100 }, (_, index) =>
      manager.loadConfig(
        'search',
        { type: 'function', load: async () => [index] },
        { values: {} },
        { search: String(index) },
      )));
  }, options);

  const largeValues = createValues(5_000);
  bench('reset 5000 fields', () => {
    const store = new FormStore(largeValues);
    store.setValue('field0', 'updated');
    store.reset();
  }, options);
});

const options = { time: 150, warmupTime: 50, iterations: 5, warmupIterations: 2 };

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
