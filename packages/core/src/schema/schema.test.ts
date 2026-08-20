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
