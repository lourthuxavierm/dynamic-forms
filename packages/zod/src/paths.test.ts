import { describe, expect, it } from 'vitest';
import { zodPathToFieldPath } from './paths';

describe('zodPathToFieldPath', () => {
  it.each([
    [[], '_form'],
    [['email'], 'email'],
    [['contacts', 0, 'email'], 'contacts[0].email'],
    [['groups', 1, 'members', 2, 'name'], 'groups[1].members[2].name'],
    [['0'], '0'],
    [[0], '[0]'],
  ] as const)('maps %j to %s', (source, expected) => {
    expect(zodPathToFieldPath(source)).toBe(expected);
  });

  it('supports a custom root and deterministic diagnostic segments', () => {
    expect(zodPathToFieldPath([], ' form ')).toBe('form');
    expect(zodPathToFieldPath(['profile.name'])).toBe('["profile.name"]');
    expect(zodPathToFieldPath([''])).toBe('[""]');
    expect(zodPathToFieldPath([Symbol('token')])).toBe('["$symbol:token"]');
    expect(zodPathToFieldPath([-1])).toBe('["-1"]');
  });
});
