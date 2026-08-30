import type { FormSchema } from '@dynamic-forms/core';
export type View = 'design' | 'preview' | 'json';
export interface BuilderState { schema: FormSchema; selectedPath?: string; view: View; past: readonly FormSchema[]; future: readonly FormSchema[]; saved: boolean; message?: string }
export type Action = { type: 'commit'; schema: FormSchema; selectedPath?: string; message?: string } | { type: 'select'; path?: string } | { type: 'view'; view: View } | { type: 'undo' } | { type: 'redo' } | { type: 'saved' } | { type: 'message'; message?: string };
export const initialState = (schema: FormSchema): BuilderState => ({ schema, selectedPath: schema.fields[0]?.name, view: 'design', past: [], future: [], saved: true });
export function reducer(state: BuilderState, action: Action): BuilderState {
  if (action.type === 'select') return { ...state, selectedPath: action.path };
  if (action.type === 'view') return { ...state, view: action.view };
  if (action.type === 'saved') return { ...state, saved: true };
  if (action.type === 'message') return { ...state, message: action.message };
  if (action.type === 'commit') return { ...state, schema: action.schema, selectedPath: action.selectedPath ?? state.selectedPath, past: [...state.past.slice(-49), state.schema], future: [], saved: false, message: action.message };
  if (action.type === 'undo' && state.past.length) return { ...state, schema: state.past.at(-1)!, past: state.past.slice(0, -1), future: [state.schema, ...state.future], saved: false };
  if (action.type === 'redo' && state.future.length) return { ...state, schema: state.future[0], past: [...state.past, state.schema], future: state.future.slice(1), saved: false };
  return state;
}
