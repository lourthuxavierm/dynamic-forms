import { describe, expect, it } from 'vitest';
import { compileSchemaOrThrow } from './compilation';
import { defineFormSchema, definePortableFormSchema, type InferFormValues } from './types';

describe('schema definition helpers', () => {
  it('defineFormSchema returns the same object and preserves literal inference', () => {
    const input = { id: 'defined', schemaVersion: 1, fields: [{ name: 'age', type: 'number' }, { name: 'agree', type: 'checkbox' }] } as const;
    const schema = defineFormSchema(input);
    expect(schema).toBe(input);

    const values: InferFormValues<typeof schema> = { age: 30, agree: true };
    expect(values.age).toBe(30);
  });

  it('definePortableFormSchema accepts JSON-safe schemas that round-trip through JSON', () => {
    const schema = definePortableFormSchema({
      id: 'portable',
      schemaVersion: 1,
      fields: [
        { name: 'country', type: 'select', options: [{ label: 'India', value: 'IN', metadata: { region: 'APAC' } }] },
        { name: 'city', type: 'select', dependsOn: ['country'], dataSource: { type: 'url', url: '/cities', params: { country: '$country' } } },
      ],
    });
    const roundTripped = JSON.parse(JSON.stringify(schema)) as typeof schema;
    expect(roundTripped).toEqual(schema);
    expect(compileSchemaOrThrow(roundTripped).fieldsByPath.get('city')?.dependsOn).toEqual(['country']);
  });
});
