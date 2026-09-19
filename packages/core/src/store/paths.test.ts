import { describe, expect, it } from 'vitest';
import { deleteByPath, dynamicPath, getByPath, isAncestorPath, isDescendantPath, isSamePath, joinPath, normalizePath, parentPath, parsePath, setByPath } from './paths';

describe('typed path runtime primitives', () => {
  it('canonicalizes and compares object and array paths', () => {
    expect(normalizePath('items[0].name')).toBe('items.0.name');
    expect(parsePath('items.0.name')).toEqual(['items', '0', 'name']);
    expect(joinPath('items[0]', 'name')).toBe('items.0.name');
    expect(parentPath('items[0].name')).toBe('items.0');
    expect(isSamePath('items[0]', 'items.0')).toBe(true);
    expect(isAncestorPath('items', 'items[0].name')).toBe(true);
    expect(isDescendantPath('items.0.name', 'items')).toBe(true);
    expect(() => normalizePath('items..name')).toThrow('Invalid field path');
  });
  it('reads dot and bracket array paths', () => {
    const values = { contacts: [{ name: 'Ada', phones: ['111', '222'] }] };

    expect(getByPath(values, 'contacts.0.name')).toBe('Ada');
    expect(getByPath(values, 'contacts[0].phones[1]')).toBe('222');
  });

  it('updates nested arrays immutably', () => {
    const values = { contacts: [{ name: 'Ada' }], untouched: { stable: true } };
    const updated = setByPath(values, 'contacts[0].name', 'Grace');

    expect(updated.contacts[0].name).toBe('Grace');
    expect(values.contacts[0].name).toBe('Ada');
    expect(updated).not.toBe(values);
    expect(updated.contacts).not.toBe(values.contacts);
    expect(updated.untouched).toBe(values.untouched);
  });

  it('creates missing array containers for runtime paths', () => {
    const updated = setByPath({}, dynamicPath('groups[0].members[0].name'), 'Ada');

    expect(updated).toEqual({ groups: [{ members: [{ name: 'Ada' }] }] });
  });

  it('deletes nested array entries without mutating the source', () => {
    const values = { tags: ['one', 'two', 'three'] };
    const updated = deleteByPath(values, 'tags[1]');

    expect(updated).toEqual({ tags: ['one', 'three'] });
    expect(values.tags).toEqual(['one', 'two', 'three']);
  });
});
