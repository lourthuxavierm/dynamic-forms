import { describe, expect, it } from 'vitest';
import { evaluateCondition } from '../conditions';
import { DependencyGraph } from '../dependencies';
import { FormRuntime } from '../runtime';
import { dynamicPath } from '../store';
import type { FormSchema } from './index';
import { compileSchema, createArrayItemValue, normalizeSchema, normalizeSchemaOrThrow, validateSchema } from './index';

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

function cycleCodes(schema: FormSchema) {
  return normalizeSchema(schema).diagnostics.filter((item) => item.code === 'DEPENDENCY_CYCLE');
}

describe('schema basics', () => {
  it('accepts an empty schema and compiles empty indexes', () => {
    const result = compileSchema({ schemaVersion: 1, id: 'empty', fields: [] });

    expect(result.valid).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.schema?.fieldsByPath.size).toBe(0);
    expect(result.schema?.dependencyGraph.dependenciesByField.size).toBe(0);
  });

  it('passes unknown field types through for renderer-registered controls', () => {
    const result = normalizeSchema({ id: 'custom', fields: [{ name: 'brand', type: 'color-picker' }] });

    expect(result.valid).toBe(true);
    expect(result.schema?.fields[0]).toMatchObject({ name: 'brand', type: 'color-picker', label: 'Brand' });
    expect(result.schema?.fields[0].defaultValue).toBeUndefined();
  });
});

describe('structural fields', () => {
  it('rejects an object field without children', () => {
    const result = normalizeSchema({ id: 'empty-object', fields: [{ name: 'address', type: 'object', fields: [] }] });

    expect(result.valid).toBe(false);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: 'FIELD_CHILDREN_REQUIRED', path: 'address', severity: 'error' }),
    ]);
  });

  it('supports arrays nested inside array items', () => {
    const input: FormSchema = { id: 'matrix', fields: [
      { name: 'rows', type: 'array', fields: [
        { name: 'label', type: 'text' },
        { name: 'cells', type: 'array', fields: [{ name: 'value', type: 'number' }] },
      ] },
    ] };
    const schema = normalizeSchemaOrThrow(input);

    expect(createArrayItemValue(schema, 'rows')).toEqual({ label: '', cells: [] });
    expect(createArrayItemValue(schema, 'rows.0.cells')).toEqual({ value: null });
    expect(compileSchema(input).schema?.fieldsByPath.has('rows.cells.value')).toBe(true);
  });
});

describe('dependency cycles', () => {
  it('reports a three-node cycle with its full path', () => {
    const [cycle] = cycleCodes({ id: 'three', fields: [
      { name: 'a', type: 'text', dependsOn: ['c'] },
      { name: 'b', type: 'text', dependsOn: ['a'] },
      { name: 'c', type: 'text', dependsOn: ['b'] },
    ] });

    expect(cycle.details).toEqual({ cycle: ['a', 'c', 'b', 'a'] });
  });

  it('reports a long multi-node cycle', () => {
    const names = ['a', 'b', 'c', 'd', 'e', 'f'];
    const fields = names.map((name, index) => ({ name, type: 'text', dependsOn: [names[(index + 1) % names.length]] }));
    const [cycle] = cycleCodes({ id: 'multi', fields });

    expect(cycle.details?.cycle).toEqual([...names, 'a']);
  });

  it('reports a cycle between deeply nested object fields', () => {
    const [cycle] = cycleCodes({ id: 'nested', fields: [
      { name: 'billing', type: 'object', fields: [
        { name: 'address', type: 'object', fields: [
          { name: 'country', type: 'text', dependsOn: ['shipping.address.country'] },
        ] },
      ] },
      { name: 'shipping', type: 'object', fields: [
        { name: 'address', type: 'object', fields: [
          { name: 'country', type: 'text', dependsOn: ['billing.address.country'] },
        ] },
      ] },
    ] });

    expect(cycle.details?.cycle).toEqual(['billing.address.country', 'shipping.address.country', 'billing.address.country']);
  });

  it('isolates a cycle in one of several disconnected graphs', () => {
    const diagnostics = cycleCodes({ id: 'disconnected', fields: [
      { name: 'country', type: 'text' },
      { name: 'state', type: 'text', dependsOn: ['country'] },
      { name: 'x', type: 'text', dependsOn: ['y'] },
      { name: 'y', type: 'text', dependsOn: ['x'] },
    ] });

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].details?.cycle).toEqual(['x', 'y', 'x']);
  });

  it('keeps disconnected valid graphs independent at runtime', () => {
    const graph = new DependencyGraph([
      { field: 'state', dependsOn: ['country'] },
      { field: 'city', dependsOn: ['state'] },
      { field: 'discount', dependsOn: ['plan'] },
    ]);

    expect(graph.getTransitiveDependents('country')).toEqual(['state', 'city']);
    expect(graph.getTransitiveDependents('plan')).toEqual(['discount']);
    expect(() => graph.setDependencies('country', ['city'])).toThrow('Dependency cycle detected: ');
    expect(() => graph.setDependencies('plan', ['discount'])).toThrow('Dependency cycle detected: ');
  });
});

describe('condition edge values', () => {
  const values = { nil: null, missing: undefined, no: false, zero: 0, blank: '', none: [] as string[] };

  it('treats only null and undefined as absent', () => {
    expect(evaluateCondition({ field: 'nil', operator: 'exists' }, values)).toBe(false);
    expect(evaluateCondition({ field: 'missing', operator: 'exists' }, values)).toBe(false);
    expect(evaluateCondition({ field: 'unknown', operator: 'notExists' }, values)).toBe(true);
    for (const field of ['no', 'zero', 'blank', 'none']) {
      expect(evaluateCondition({ field, operator: 'exists' }, values)).toBe(true);
      expect(evaluateCondition({ field, operator: 'notExists' }, values)).toBe(false);
    }
  });

  it('compares falsy values strictly', () => {
    expect(evaluateCondition({ field: 'no', operator: 'equals', value: false }, values)).toBe(true);
    expect(evaluateCondition({ field: 'zero', operator: 'equals', value: 0 }, values)).toBe(true);
    expect(evaluateCondition({ field: 'blank', operator: 'equals', value: '' }, values)).toBe(true);
    expect(evaluateCondition({ field: 'nil', operator: 'equals', value: null }, values)).toBe(true);
    expect(evaluateCondition({ field: 'zero', operator: 'equals', value: false }, values)).toBe(false);
    expect(evaluateCondition({ field: 'blank', operator: 'equals', value: 0 }, values)).toBe(false);
    expect(evaluateCondition({ field: 'nil', operator: 'equals', value: undefined }, values)).toBe(false);
    expect(evaluateCondition({ field: 'missing', operator: 'notEquals', value: null }, values)).toBe(true);
  });

  it('never matches contains against empty or non-collection values', () => {
    expect(evaluateCondition({ field: 'none', operator: 'contains', value: 'a' }, values)).toBe(false);
    expect(evaluateCondition({ field: 'nil', operator: 'contains', value: 'a' }, values)).toBe(false);
    expect(evaluateCondition({ field: 'zero', operator: 'contains', value: 0 }, values)).toBe(false);
    expect(evaluateCondition({ field: 'blank', operator: 'contains', value: '' }, values)).toBe(true);
  });

  it('treats an empty compound condition as matching', () => {
    expect(evaluateCondition({}, values)).toBe(true);
    expect(evaluateCondition({ and: [], or: [] }, values)).toBe(false);
  });
});

describe('public schema immutability', () => {
  const schema = (): FormSchema => ({
    schemaVersion: 1,
    id: 'immutable',
    fields: [
      { name: 'name', type: 'text', required: true, dependsOn: ['plan'] },
      { name: 'plan', type: 'select', options: [{ label: 'Pro', value: 'pro' }], visibleWhen: { field: 'address.city', operator: 'exists' } },
      { name: 'address', type: 'object', fields: [{ name: 'city', type: 'text', defaultValue: 'Pune' }] },
      { name: 'items', type: 'array', fields: [{ name: 'sku', type: 'text' }], defaultValue: [{ sku: 'A1' }] },
    ],
  });

  it('does not mutate the schema during validation', () => {
    const input = deepFreeze(schema());

    expect(validateSchema(input).valid).toBe(true);
    expect(input).toEqual(schema());
  });

  it('does not mutate the schema through runtime operations', () => {
    const input = deepFreeze(schema());
    const runtime = new FormRuntime(input, {});

    runtime.store.setValue(dynamicPath('address.city'), 'Chennai');
    runtime.store.setValue(dynamicPath('items.0.sku'), 'B2');
    runtime.store.setValue(dynamicPath('plan'), 'pro');
    runtime.store.reset({ name: 'Ada' });
    runtime.dispose();

    expect(input).toEqual(schema());
  });
});
