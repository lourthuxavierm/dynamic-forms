import { describe, expect, it } from 'vitest';
import { addSection, defaultLayout, initialLayoutHistory, layoutReducer, movePlacement, normalizeLayout, removeSection, setPlacementSpan, updateSection } from './layout';

const schema = { id: 'test', fields: [{ name: 'name', type: 'text' }, { name: 'email', type: 'email' }] };

describe('builder layout', () => {
  it('creates and normalizes a two-column default layout', () => {
    const layout = defaultLayout(schema);
    expect(layout.sections[0].columns).toBe(2);
    expect(layout.sections[0].placements.map((item) => item.fieldPath)).toEqual(['name', 'email']);
    expect(normalizeLayout({ ...schema, fields: [...schema.fields, { name: 'phone', type: 'phone' }] }, layout).sections[0].placements.at(-1)?.fieldPath).toBe('phone');
  });
  it('updates sections, moves placements, clamps spans, and relocates fields on removal', () => {
    let layout = addSection(defaultLayout(schema));
    layout = updateSection(layout, 'section-2', { title: 'Contact', columns: 1 });
    layout = movePlacement(layout, 'email', 'section-2');
    layout = setPlacementSpan(layout, 'email', 4);
    expect(layout.sections[1].placements[0].columnSpan).toBe(1);
    expect(removeSection(layout, 'section-2').sections[0].placements.map((item) => item.fieldPath)).toContain('email');
  });
  it('supports layout undo and redo', () => {
    const first = defaultLayout(schema);
    const second = updateSection(first, 'personal-details', { columns: 1 });
    const committed = layoutReducer(initialLayoutHistory(first), { type: 'commit', layout: second });
    expect(layoutReducer(committed, { type: 'undo' }).present.sections[0].columns).toBe(2);
    expect(layoutReducer(layoutReducer(committed, { type: 'undo' }), { type: 'redo' }).present.sections[0].columns).toBe(1);
  });
});

