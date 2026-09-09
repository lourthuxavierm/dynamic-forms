import { describe, expect, it } from 'vitest';
import { createField, palette, paletteGroups } from './catalogue';

describe('builder field catalogue', () => {
  it('contains unique field types with visual metadata', () => {
    expect(new Set(palette.map((item) => item.type)).size).toBe(palette.length);
    expect(palette.every((item) => item.label && item.icon && item.accent)).toBe(true);
  });

  it('uses the reference category order and retains layout utilities', () => {
    expect(paletteGroups).toEqual(['Basic Inputs', 'Selection', 'Date & Time', 'Advanced', 'Structure', 'Layout & Utilities']);
  });

  it('creates fields with the existing option and structural defaults', () => {
    expect(createField('select', 'choice').options).toHaveLength(2);
    expect(createField('object', 'details').fields?.[0].type).toBe('text');
  });
});

