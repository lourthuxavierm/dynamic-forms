import { describe, expect, it } from 'vitest';
import { FormRuntime } from '../runtime';
import type { FormSchema, SchemaMigration } from './index';
import {
  CURRENT_SCHEMA_VERSION,
  SchemaNormalizationError,
  createInitialValues,
  createArrayItemValue,
  mergeSchemaInitialValues,
  normalizeSchema,
  normalizeSchemaOrThrow,
} from './normalization';

describe('schema normalization and versioning', () => {
  it('creates a deeply frozen canonical schema without mutating the input', () => {
    const input: FormSchema = {
      id: 'customer',
      version: 'v2.3',
      fields: [
        { name: 'fullName', type: 'text' },
        {
          name: 'address',
          type: 'object',
          fields: [{ name: 'postal_code', type: 'text', validation: { required: true } }],
        },
        { name: 'marketing', type: 'checkbox', dependsOn: ['fullName', 'fullName'] },
        { name: 'country', type: 'select', dataSource: { options: ['IN'] } },
      ],
    };

    const normalized = normalizeSchemaOrThrow(input);

    expect(normalized).toMatchObject({ id: 'customer', version: 'v2.3', schemaVersion: 1 });
    expect(normalized.fields[0]).toMatchObject({
      label: 'Full Name',
      defaultValue: '',
      hiddenValuePolicy: 'preserve',
      dependsOn: [],
      resetOnDependencyChange: false,
      options: [],
      validation: {},
      fields: [],
    });
    expect(normalized.fields[1].defaultValue).toEqual({ postal_code: '' });
    expect(normalized.fields[2].dependsOn).toEqual(['fullName']);
    expect(normalized.fields[3].dataSource).toMatchObject({
      type: 'static',
      method: 'GET',
      cache: false,
      params: {},
    });
    expect(Object.isFrozen(normalized)).toBe(true);
    expect(Object.isFrozen(normalized.fields[1].fields[0].validation)).toBe(true);
    expect(input).not.toHaveProperty('schemaVersion');
    expect(input.fields[0]).not.toHaveProperty('defaultValue');
  });

  it('creates initial values for scalar, collection, range, and nested fields', () => {
    const schema = normalizeSchemaOrThrow({
      id: 'defaults',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'enabled', type: 'switch' },
        { name: 'amount', type: 'number' },
        { name: 'tags', type: 'multi-select' },
        { name: 'range', type: 'date-range' },
        { name: 'profile', type: 'object', fields: [{ name: 'email', type: 'email', defaultValue: 'a@b.test' }] },
      ],
    });

    expect(createInitialValues(schema)).toEqual({
      name: '', enabled: false, amount: null, tags: [], range: [null, null],
      profile: { email: 'a@b.test' },
    });
  });

  it('deeply merges explicit object values and creates fresh array item defaults', () => {
    const schema = normalizeSchemaOrThrow({ id: 'nested-defaults', fields: [
      { name: 'profile', type: 'object', fields: [{ name: 'name', type: 'text', defaultValue: 'Anonymous' }, { name: 'address', type: 'object', fields: [{ name: 'city', type: 'text', defaultValue: 'Chennai' }, { name: 'zip', type: 'text', defaultValue: '600001' }] }] },
      { name: 'contacts', type: 'array', fields: [{ name: 'kind', type: 'text', defaultValue: 'home' }, { name: 'value', type: 'text' }] },
    ] });
    expect(mergeSchemaInitialValues(schema, { profile: { address: { city: 'Pune' } } })).toEqual({ profile: { name: 'Anonymous', address: { city: 'Pune', zip: '600001' } }, contacts: [] });
    const first = createArrayItemValue(schema, 'contacts') as Record<string, unknown>;
    const second = createArrayItemValue(schema, 'contacts') as Record<string, unknown>;
    expect(first).toEqual({ kind: 'home', value: '' }); expect(first).not.toBe(second);
  });

  it('returns categorized diagnostics for invalid references, duplicates, and cycles', () => {
    const result = normalizeSchema({
      id: 'invalid',
      fields: [
        { name: 'a', type: 'text', dependsOn: ['b'] },
        { name: 'b', type: 'text', dependsOn: ['a'], visibleWhen: { field: 'missing', operator: 'exists' } },
        { name: 'c', type: 'text' },
        { name: 'c', type: 'text' },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.schema).toBeUndefined();
    expect(result.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining([
      'FIELD_DUPLICATE', 'CONDITION_REFERENCE_NOT_FOUND', 'DEPENDENCY_CYCLE',
    ]));
    expect(result.diagnostics.find((item) => item.code === 'CONDITION_REFERENCE_NOT_FOUND')).toMatchObject({ relatedPath: 'missing' });
    expect(result.diagnostics.find((item) => item.code === 'DEPENDENCY_CYCLE')?.details).toMatchObject({ cycle: ['a', 'b', 'a'] });
    expect(() => normalizeSchemaOrThrow({
      id: 'cycle',
      fields: [
        { name: 'a', type: 'text', dependsOn: ['b'] },
        { name: 'b', type: 'text', dependsOn: ['a'] },
      ],
    })).toThrow('Dependency cycle detected');
  });

  it('returns structured warnings without preventing compilation', () => {
    const result = normalizeSchema({ id: 'warnings', fields: [{ name: 'country', type: 'select' }, { name: 'token', type: 'hidden', validation: { required: true } }] });
    expect(result.valid).toBe(true);
    expect(result.schema).toBeDefined();
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'SELECT_WITHOUT_OPTIONS', severity: 'warning', path: 'country' }),
      expect.objectContaining({ code: 'HIDDEN_REQUIRED_FIELD', severity: 'warning', path: 'token' }),
    ]));
  });

  it('rejects future versions and reports missing migration paths', () => {
    expect(normalizeSchema({ id: 'future', schemaVersion: 2, fields: [] }).diagnostics[0]?.code)
      .toBe('SCHEMA_UNSUPPORTED_VERSION');
    expect(normalizeSchema({ id: 'old', schemaVersion: 0, fields: [] }).diagnostics[0]?.code)
      .toBe('SCHEMA_MIGRATION_MISSING');
  });

  it('runs explicit migrations in order and gives migrations immutable input', () => {
    const migrations: SchemaMigration[] = [{
      from: 0,
      to: 1,
      migrate(schema) {
        expect(Object.isFrozen(schema)).toBe(true);
        return { ...schema, id: 'migrated', schemaVersion: 1 };
      },
    }];
    const result = normalizeSchema({ id: 'old', schemaVersion: 0, fields: [] }, { migrations });

    expect(result.valid).toBe(true);
    expect(result.schema).toMatchObject({ id: 'migrated', schemaVersion: CURRENT_SCHEMA_VERSION });
  });

  it('can throw structured diagnostics', () => {
    try {
      normalizeSchema({ id: '', fields: [] }, { throwOnError: true });
      throw new Error('Expected normalization to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaNormalizationError);
      expect((error as SchemaNormalizationError).diagnostics[0]?.code).toBe('SCHEMA_INVALID');
    }
  });

  it('makes FormRuntime consume the normalized schema and merge schema defaults', () => {
    const runtime = new FormRuntime(
      { id: 'runtime', fields: [{ name: 'name', type: 'text' }, { name: 'count', type: 'number', defaultValue: 3 }] },
      { name: 'Ada' },
    );

    expect(runtime.schema.schemaVersion).toBe(1);
    expect(runtime.store.getValues()).toEqual({ name: 'Ada', count: 3 });
    runtime.dispose();
  });
});
