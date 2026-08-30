import { describe, expect, it } from 'vitest';
import { initialState, reducer } from './reducer';
const first = { id: 'one', fields: [] }; const second = { id: 'two', fields: [] };
describe('builder reducer', () => {
  it('records commits and supports undo and redo', () => { const committed = reducer(initialState(first), { type: 'commit', schema: second }); const undone = reducer(committed, { type: 'undo' }); expect(undone.schema.id).toBe('one'); expect(reducer(undone, { type: 'redo' }).schema.id).toBe('two'); });
  it('clears redo after a new commit', () => { const undone = reducer(reducer(initialState(first), { type: 'commit', schema: second }), { type: 'undo' }); expect(reducer(undone, { type: 'commit', schema: { id: 'three', fields: [] } }).future).toHaveLength(0); });
  it('does not record view and selection changes', () => { const state = reducer(reducer(initialState(first), { type: 'select', path: 'field' }), { type: 'view', view: 'preview' }); expect(state.past).toHaveLength(0); expect(state.selectedPath).toBe('field'); });
});
