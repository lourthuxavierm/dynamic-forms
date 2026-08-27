import { describe, expect, it } from 'vitest';
import { exampleIds, formExamples, getFormExample } from './catalogue';

describe('Phase 12 example catalogue', () => {
  it('contains 14 uniquely routed examples', () => { expect(exampleIds).toHaveLength(14); expect(new Set(exampleIds).size).toBe(14); });
  it.each(formExamples)('$id has a reproducible renderer contract', (entry) => {
    expect(entry.schema.version).toBe('1.0.0'); expect(entry.schema.fields.length).toBeGreaterThan(0); expect(entry.renderers.length).toBeGreaterThan(0);
    for (const field of entry.schema.fields) expect(Object.hasOwn(entry.initialValues, field.name)).toBe(true);
  });
  it('falls back safely', () => expect(getFormExample('unknown').id).toBe('basic-form'));
});
