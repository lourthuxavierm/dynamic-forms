import { describe, expect, it } from 'vitest';
import { ANGULAR_HTML_BASELINE_FIELD_TYPES, createAngularHtmlRegistry } from './registry';

describe('Angular HTML experimental contract', () => {
  it('freezes the baseline field-type inventory', () => {
    expect(ANGULAR_HTML_BASELINE_FIELD_TYPES).toHaveLength(15);
    expect(Object.isFrozen(ANGULAR_HTML_BASELINE_FIELD_TYPES)).toBe(true);
  });

  it('creates immutable registries and removes undefined entries', () => {
    class TextControl {}
    const registry = createAngularHtmlRegistry({ text: TextControl, removed: undefined });
    expect(registry.text).toBe(TextControl);
    expect('removed' in registry).toBe(false);
    expect(Object.isFrozen(registry)).toBe(true);
  });
});
