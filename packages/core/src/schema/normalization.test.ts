import { describe, expect, it } from 'vitest';
import { FormRuntime } from '../runtime';
import type { FormSchema, SchemaMigration } from './index';
import {
  CURRENT_SCHEMA_VERSION,
  SchemaNormalizationError,
  createInitialValues,
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
      'duplicate-field', 'invalid-reference', 'dependency-cycle',
    ]));
    expect(() => normalizeSchemaOrThrow({
      id: 'cycle',
      fields: [
        { name: 'a', type: 'text', dependsOn: ['b'] },
        { name: 'b', type: 'text', dependsOn: ['a'] },
      ],
    })).toThrow('Dependency cycle detected');
  });

  it('rejects future versions and reports missing migration paths', () => {
    expect(normalizeSchema({ id: 'future', schemaVersion: 2, fields: [] }).diagnostics[0]?.code)
      .toBe('unsupported-schema-version');
    expect(normalizeSchema({ id: 'old', schemaVersion: 0, fields: [] }).diagnostics[0]?.code)
      .toBe('missing-migration');
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
      expect((error as SchemaNormalizationError).diagnostics[0]?.code).toBe('invalid-schema');
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
