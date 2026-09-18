import { describe, it, expect } from 'vitest';
import { validateSchema } from './validation';
import type { FormSchema, InferSchemaType } from './types';

describe('Core Schema', () => {
  describe('validateSchema', () => {
    it('should validate a simple valid schema', () => {
      const schema: FormSchema = {
        id: 'test-form',
        fields: [
          { name: 'firstName', type: 'text' },
          { name: 'lastName', type: 'text' },
        ],
      };

      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate field names', () => {
      const schema: FormSchema = {
        id: 'test-form',
        fields: [
          { name: 'firstName', type: 'text' },
          { name: 'firstName', type: 'text' },
        ],
      };

      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ path: 'firstName', message: 'Duplicate field name: firstName' })
      );
    });

    it('should validate nested fields', () => {
      const schema: FormSchema = {
        id: 'test-form',
        fields: [
          {
            name: 'address',
            type: 'object',
            fields: [
              { name: 'street', type: 'text' },
              { name: 'city', type: 'text' },
            ],
          },
        ],
      };

      const result = validateSchema(schema);
      expect(result.valid).toBe(true);
    });

    it('should detect duplicate field names in nested fields', () => {
      const schema: FormSchema = {
        id: 'test-form',
        fields: [
          {
            name: 'address',
            type: 'object',
            fields: [
              { name: 'street', type: 'text' },
              { name: 'street', type: 'text' },
            ],
          },
        ],
      };

      const result = validateSchema(schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ path: 'address.street', message: 'Duplicate field name: street' })
      );
    });
  });

  describe('InferSchemaType', () => {
    it('should correctly infer simple types', () => {
      const schema = {
        id: 'test',
        fields: [
          { name: 'name', type: 'text' },
          { name: 'age', type: 'number' },
          { name: 'active', type: 'checkbox' },
        ],
      } as const;

      type Inferred = InferSchemaType<typeof schema>;
      
      // We can't strictly test types at runtime with Vitest, but we can verify the shape
      // if we were using a tool like tsd or just rely on compilation during build.
      // For this test, we are just documenting the intent.
      const example: Inferred = {
        name: 'John',
        age: 30,
        active: true,
      };
      
      expect(example.name).toBe('John');
      expect(example.age).toBe(30);
      expect(example.active).toBe(true);
    });

    it('should correctly infer nested object types', () => {
      const schema = {
        id: 'test',
        fields: [
          {
            name: 'profile',
            type: 'object',
            fields: [
              { name: 'bio', type: 'text' },
              { name: 'rating', type: 'number' },
            ],
          },
        ],
      } as const;

      type Inferred = InferSchemaType<typeof schema>;
      
      const example: Inferred = {
        profile: {
          bio: 'Hello',
          rating: 5,
        },
      };

      expect(example.profile.bio).toBe('Hello');
      expect(example.profile.rating).toBe(5);
    });

    it('should correctly infer array types', () => {
      const schema = {
        id: 'test',
        fields: [
          {
            name: 'tags',
            type: 'array',
            fields: [
              { name: 'label', type: 'text' },
            ],
          },
        ],
      } as const;

      type Inferred = InferSchemaType<typeof schema>;
      
      const example: Inferred = {
        tags: [
          { label: 'Tag 1' },
          { label: 'Tag 2' },
        ],
      };

      expect(example.tags[0].label).toBe('Tag 1');
    });
  });
});

  it('accepts declarative conditions, dependencies, data sources, and configuration', () => {
    const schema: FormSchema = {
      id: 'contract',
      fields: [
        { name: 'country', type: 'select' },
        {
          name: 'state',
          type: 'autocomplete',
          visibleWhen: { field: 'country', operator: 'exists' },
          dependsOn: ['country'],
          dataSource: { type: 'url', url: '/api/states', params: { country: '$country' } },
          config: { searchable: true },
        },
      ],
    };

    expect(validateSchema(schema)).toMatchObject({ valid: true, errors: [] });
  });

  it('requires optional field ids to be trimmed, non-empty, and unique form-wide', () => {
    const result = validateSchema({ id: 'field-identities', fields: [
      { id: '', name: 'empty', type: 'text' },
      { id: ' padded ', name: 'padded', type: 'text' },
      { id: 'stable-profile', name: 'profile', type: 'object', fields: [
        { id: 'duplicate-id', name: 'name', type: 'text' },
      ] },
      { id: 'stable-items', name: 'items', type: 'array', fields: [
        { id: 'duplicate-id', name: 'value', type: 'text' },
      ] },
    ] });
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'FIELD_ID_EMPTY', path: 'empty' }),
      expect.objectContaining({ code: 'FIELD_ID_INVALID', path: 'padded' }),
      expect.objectContaining({ code: 'FIELD_ID_DUPLICATE', path: 'items.value', relatedPath: 'profile.name', details: { id: 'duplicate-id' } }),
    ]));
    expect(result.errors).toHaveLength(3);
  });

  it('accepts globally unique opaque ids independent of field paths', () => {
    expect(validateSchema({ id: 'valid-identities', fields: [
      { id: 'fld_01JABC', name: 'profile', type: 'object', fields: [
        { id: 'customer-name-v1', name: 'name', type: 'text' },
      ] },
      { id: 'anything-stable', name: 'name', type: 'text' },
    ] })).toMatchObject({ valid: true, errors: [] });
  });

  it('rejects indexed and ambiguous array-item references deterministically', () => {
    const schema: FormSchema = {
      id: 'indexed-references',
      fields: [
        { name: 'items', type: 'array', fields: [{ name: 'enabled', type: 'checkbox' }] },
        { name: 'details', type: 'text', visibleWhen: { field: 'items.0.enabled', operator: 'equals', value: true }, dependsOn: ['items[0].enabled'] },
      ],
    };

    const errors = validateSchema(schema).errors;
    expect(errors.filter((error) => error.code === 'FIELD_REFERENCE_INDEX_NOT_SUPPORTED')).toHaveLength(2);
    expect(errors.map((error) => error.relatedPath)).toEqual(['items.0.enabled', 'items.0.enabled']);
  });
  it('rejects runtime reference behavior declared inside array item templates', () => {
    const result = validateSchema({ id: 'array-item-behavior', fields: [
      { name: 'enabled', type: 'checkbox' },
      { name: 'items', type: 'array', fields: [
        { name: 'value', type: 'text', dependsOn: ['enabled'], resetOnDependencyChange: true },
      ] },
    ] });
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'ARRAY_ITEM_BEHAVIOR_NOT_SUPPORTED', path: 'items.value' }));
  });
  it('allows top-level fields to reference an array as a whole', () => {
    const result = validateSchema({ id: 'array-container-reference', fields: [
      { name: 'items', type: 'array', fields: [{ name: 'value', type: 'text' }] },
      { name: 'summary', type: 'text', visibleWhen: { field: 'items', operator: 'exists' }, dependsOn: ['items'] },
    ] });
    expect(result).toMatchObject({ valid: true, errors: [] });
  });
  it('validates nested datasource parameter references before runtime', () => {
    const valid = validateSchema({ id: 'source-refs', fields: [
      { name: 'country', type: 'text' },
      { name: 'state', type: 'select', dataSource: { type: 'url', url: '/states', params: { country: '$country', nested: { source: { fromField: 'country' } } } } },
    ] });
    expect(valid.valid).toBe(true);

    const invalid = validateSchema({ id: 'bad-source-ref', fields: [
      { name: 'state', type: 'select', dataSource: { type: 'url', url: '/states', params: { country: { fromField: 'missing' } } } },
    ] });
    expect(invalid.errors).toContainEqual(expect.objectContaining({ message: 'Unknown data source parameter field: missing' }));
  });
  it('rejects built-in default type mismatches and validates option identity recursively', () => {
    const result = validateSchema({ id: 'value-contracts', fields: [
      { name: 'title', type: 'text', defaultValue: 42 },
      { name: 'count', type: 'number', defaultValue: '1' },
      { name: 'period', type: 'date-range', defaultValue: ['2026-01-01', 2] },
      { name: 'upload', type: 'file', defaultValue: { name: 'missing-size-and-type' } },
      { name: 'choice', type: 'select', options: [{ label: 'Number', value: 1 }, { label: 'String', value: '1' }, { label: 'Group', value: 'group', children: [{ label: 'A', value: 'a' }, { label: 'Again', value: 'a' }] }] },
    ] });
    expect(result.errors.filter((error) => error.code === 'DEFAULT_VALUE_TYPE_MISMATCH')).toHaveLength(4);
    expect(result.errors.filter((error) => error.code === 'OPTION_DUPLICATE_VALUE')).toHaveLength(1);
  });
  it('recursively validates object, object-array, and primitive-array defaults', () => {
    const result = validateSchema({ id: 'nested-default-contracts', fields: [
      { name: 'profile', type: 'object', fields: [
        { name: 'age', type: 'number' },
        { name: 'avatar', type: 'file' },
      ], defaultValue: { age: 'not-a-number', avatar: { name: 'missing-size' }, extra: true } },
      { name: 'periods', type: 'array', fields: [
        { name: 'range', type: 'date-range' },
        { name: 'status', type: 'select' },
      ], defaultValue: [
        { range: ['2026-01-01', 2], status: { invalid: true } },
        'not-an-object',
      ] },
      { name: 'scores', type: 'array', metadata: { primitiveItems: true }, fields: [
        { name: 'score', type: 'number' },
      ], defaultValue: [1, 'two'] },
    ] });

    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'DEFAULT_VALUE_TYPE_MISMATCH', path: 'profile.age' }),
      expect.objectContaining({ code: 'DEFAULT_VALUE_TYPE_MISMATCH', path: 'profile.avatar' }),
      expect.objectContaining({ code: 'DEFAULT_VALUE_UNKNOWN_KEY', path: 'profile.extra' }),
      expect.objectContaining({ code: 'DEFAULT_VALUE_TYPE_MISMATCH', path: 'periods.0.range' }),
      expect.objectContaining({ code: 'DEFAULT_VALUE_TYPE_MISMATCH', path: 'periods.0.status' }),
      expect.objectContaining({ code: 'DEFAULT_VALUE_TYPE_MISMATCH', path: 'periods.1' }),
      expect.objectContaining({ code: 'DEFAULT_VALUE_TYPE_MISMATCH', path: 'scores.1' }),
    ]));
    expect(result.errors).toHaveLength(7);
  });
  it('accepts partial nested defaults that match declared child fields', () => {
    const result = validateSchema({ id: 'valid-nested-defaults', fields: [
      { name: 'profile', type: 'object', fields: [
        { name: 'age', type: 'number' },
        { name: 'name', type: 'text' },
      ], defaultValue: { age: 42 } },
      { name: 'items', type: 'array', fields: [
        { name: 'enabled', type: 'checkbox' },
      ], defaultValue: [{ enabled: true }, {}] },
      { name: 'scores', type: 'array', metadata: { primitiveItems: true }, fields: [
        { name: 'score', type: 'number' },
      ], defaultValue: [1, null, 3] },
    ] });
    expect(result).toMatchObject({ valid: true, errors: [] });
  });
  it('rejects invalid datasource pagination, cache, and debounce configuration', () => {
    const result = validateSchema({ id: 'invalid-datasource-options', fields: [
      { name: 'paged', type: 'select', dataSource: { type: 'url', url: '/items', pageParam: 'page' } },
      { name: 'cached', type: 'select', dataSource: { type: 'url', url: '/items', cacheKey: 'items' } },
      { name: 'search', type: 'async-autocomplete', config: { debounceMs: -1 } },
    ] });
    expect(result.errors.filter((error) => error.code === 'DATASOURCE_INVALID')).toHaveLength(2);
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'FIELD_CONFIG_INVALID', path: 'search' }));
  });
  it('rejects invalid structure, references, rule ranges, option values, and data sources', () => {
    const schema: FormSchema = {
      id: 'invalid-contract',
      fields: [
        { name: 'country', type: 'text', fields: [{ name: 'code', type: 'text' }] },
        {
          name: 'state',
          type: 'object',
          visibleWhen: { field: 'missing', operator: 'equals', value: true },
          dependsOn: ['missing', 'state'],
          validation: { min: 10, max: 1, minItems: 2, maxItems: 1, multipleOf: 0, pattern: '[' },
          options: [{ label: 'One', value: 'one' }, { label: 'Duplicate', value: 'one' }],
          dataSource: { type: 'url' },
        },
      ],
    };

    const messages = validateSchema(schema).errors.map((error) => error.message);
    expect(messages).toEqual(expect.arrayContaining([
      'Only object and array fields may define child fields',
      'object fields must define at least one child field',
      'Unknown condition field: missing',
      'Unknown dependency field: missing',
      'A field cannot depend on itself',
      'min must not exceed max',
      'minItems must not exceed maxItems',
      'multipleOf must be greater than zero',
      'pattern must be a valid regular expression',
      'Duplicate option value: one',
      'URL data sources require a URL',
    ]));
  });
