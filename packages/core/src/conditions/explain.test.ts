import { describe, expect, it } from 'vitest';
import { evaluateCondition } from './evaluate';
import { describeValueType, explainCondition } from './explain';
import type { FieldCondition } from './types';

describe('explainCondition', () => {
  it('matches evaluateCondition for every operator', () => {
    const values = { text: 'hello', count: 5, tags: ['a', 'b'], empty: null };
    const conditions: FieldCondition[] = [
      { field: 'text', operator: 'equals', value: 'hello' },
      { field: 'text', operator: 'notEquals', value: 'hello' },
      { field: 'empty', operator: 'exists' },
      { field: 'empty', operator: 'notExists' },
      { field: 'tags', operator: 'contains', value: 'b' },
      { field: 'text', operator: 'contains', value: 'z' },
      { field: 'count', operator: 'greaterThan', value: 3 },
      { field: 'count', operator: 'lessThan', value: 3 },
      { and: [{ field: 'count', operator: 'greaterThan', value: 1 }, { field: 'text', operator: 'equals', value: 'x' }] },
      { or: [{ field: 'count', operator: 'lessThan', value: 1 }, { field: 'text', operator: 'equals', value: 'hello' }] },
      { not: { field: 'text', operator: 'equals', value: 'hello' } },
      { and: [{ field: 'count', operator: 'greaterThan', value: 1 }], not: { field: 'empty', operator: 'exists' } },
      {},
    ];
    for (const condition of conditions) {
      expect(explainCondition(condition, values).result).toBe(evaluateCondition(condition, values));
    }
  });

  it('reports the failing rule of an AND group as decisive', () => {
    const condition: FieldCondition = {
      and: [
        { field: 'country', operator: 'equals', value: 'IN' },
        { field: 'customerType', operator: 'equals', value: 'business' },
      ],
    };
    const result = explainCondition(condition, { country: 'IN', customerType: 'individual' });

    expect(result.result).toBe(false);
    expect(result.decisive).toHaveLength(1);
    expect(result.decisive[0]).toMatchObject({ field: 'customerType', operator: 'equals', expected: 'business', result: false, actualType: 'string' });
  });

  it('reports the satisfying rule of an OR group as decisive', () => {
    const condition: FieldCondition = { or: [{ field: 'a', operator: 'exists' }, { field: 'b', operator: 'exists' }] };
    const result = explainCondition(condition, { b: 1 });
    expect(result.result).toBe(true);
    expect(result.decisive.map((rule) => rule.field)).toEqual(['b']);
  });

  it('reports the negated rule of a NOT as decisive', () => {
    const result = explainCondition({ not: { field: 'blocked', operator: 'equals', value: true } }, { blocked: true });
    expect(result.result).toBe(false);
    expect(result.explanation.kind).toBe('not');
    expect(result.decisive[0]).toMatchObject({ field: 'blocked', result: true });
  });

  it('redacts actual values unless includeValues is enabled', () => {
    const condition: FieldCondition = { field: 'ssn', operator: 'exists' };
    const redacted = explainCondition(condition, { ssn: '123-45-6789' });
    expect(redacted.decisive[0]).not.toHaveProperty('actual');
    expect(redacted.decisive[0].actualType).toBe('string');

    const revealed = explainCondition(condition, { ssn: '123-45-6789' }, { includeValues: true });
    expect(revealed.decisive[0].actual).toBe('123-45-6789');
  });

  it('returns deeply frozen explanations', () => {
    const result = explainCondition({ and: [{ field: 'a', operator: 'exists' }] }, {});
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.explanation)).toBe(true);
    expect(Object.isFrozen(result.decisive)).toBe(true);
  });

  it('describes value types without exposing values', () => {
    expect([undefined, null, 'x', 1, true, [], {}, 1n, Symbol('s'), () => undefined].map(describeValueType))
      .toEqual(['undefined', 'null', 'string', 'number', 'boolean', 'array', 'object', 'bigint', 'symbol', 'function']);
  });
});
