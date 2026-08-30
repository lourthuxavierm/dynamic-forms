import { describe, expect, it } from 'vitest';
import type { FormSchema } from '@dynamic-forms/core';
import { allPaths, duplicateField, findField, insertField, moveField, moveToParent, normalizeType, removeField, uniqueName, updateField } from './operations';
const schema: FormSchema = { id: 'test', fields: [{ name: 'name', type: 'text' }, { name: 'group', type: 'object', fields: [{ name: 'email', type: 'email' }] }] };
describe('schema operations', () => {
  it('finds and immutably updates nested fields', () => { const next = updateField(schema, 'group.email', { label: 'Email' }); expect(findField(next, 'group.email')?.field.label).toBe('Email'); expect(findField(schema, 'group.email')?.field.label).toBeUndefined(); });
  it('generates unique sibling names', () => { expect(uniqueName(schema, '', 'name')).toBe('name2'); expect(uniqueName(schema, 'group', 'email')).toBe('email2'); });
  it('inserts, reorders, and removes fields', () => { const added = insertField(schema, '', { name: 'age', type: 'number' }); const moved = moveField(added, 'age', 0); expect(moved.fields[0].name).toBe('age'); expect(removeField(moved, 'age').fields.map((field) => field.name)).toEqual(['name','group']); });
  it('duplicates nested fields with a new path', () => { const result = duplicateField(schema, 'group.email'); expect(result.path).toBe('group.email2'); expect(allPaths(result.schema)).toContain('group.email2'); });
  it('moves fields between valid parents and rejects descendants', () => { const nested = moveToParent(schema, 'name', 'group'); expect(nested.path).toBe('group.name'); expect(findField(nested.schema, 'group.name')).toBeTruthy(); expect(moveToParent(schema, 'group', 'group.email').schema).toBe(schema); });
  it('normalizes incompatible settings when type changes', () => { const next = normalizeType({ name: 'amount', type: 'text', options: [{ label: 'A', value: 'a' }], validation: { minLength: 3, required: true } }, 'number'); expect(next.options).toBeUndefined(); expect(next.validation).toEqual({ required: true, min: undefined, max: undefined, multipleOf: undefined }); });
});
