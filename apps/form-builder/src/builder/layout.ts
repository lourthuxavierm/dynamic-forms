import type { FormSchema } from '@dynamic-form-engine/core';

export type LayoutColumns = 1 | 2 | 3 | 4;
export type LayoutSpan = 1 | 2 | 3 | 4;

export interface FieldPlacement { fieldPath: string; columnSpan: LayoutSpan }
export interface FormSection { id: string; title: string; description?: string; columns: LayoutColumns; placements: readonly FieldPlacement[] }
export interface BuilderLayout { version: 1; sections: readonly FormSection[] }

export const defaultLayout = (schema: FormSchema): BuilderLayout => ({
  version: 1,
  sections: [{ id: 'personal-details', title: 'Personal Details', description: 'Basic information about the customer', columns: 2, placements: schema.fields.map((field) => ({ fieldPath: field.name, columnSpan: 1 })) }],
});

export function normalizeLayout(schema: FormSchema, layout?: BuilderLayout): BuilderLayout {
  const paths = schema.fields.map((field) => field.name);
  const valid = new Set(paths);
  const seen = new Set<string>();
  const sections = (layout?.sections.length ? layout.sections : defaultLayout(schema).sections).map((section) => ({
    ...section,
    columns: Math.min(4, Math.max(1, section.columns)) as LayoutColumns,
    placements: section.placements.filter((placement) => valid.has(placement.fieldPath) && !seen.has(placement.fieldPath) && seen.add(placement.fieldPath)).map((placement) => ({ ...placement, columnSpan: Math.min(section.columns, Math.max(1, placement.columnSpan)) as LayoutSpan })),
  }));
  const missing = paths.filter((path) => !seen.has(path)).map((fieldPath) => ({ fieldPath, columnSpan: 1 as LayoutSpan }));
  if (missing.length) sections[0] = { ...sections[0], placements: [...sections[0].placements, ...missing] };
  return { version: 1, sections };
}

export function updateSection(layout: BuilderLayout, sectionId: string, patch: Partial<Omit<FormSection, 'id' | 'placements'>>): BuilderLayout {
  return { ...layout, sections: layout.sections.map((section) => section.id === sectionId ? { ...section, ...patch } : section) };
}

export function addSection(layout: BuilderLayout): BuilderLayout {
  let index = layout.sections.length + 1;
  let id = `section-${index}`;
  while (layout.sections.some((section) => section.id === id)) id = `section-${++index}`;
  return { ...layout, sections: [...layout.sections, { id, title: `Section ${index}`, columns: 2, placements: [] }] };
}

export function removeSection(layout: BuilderLayout, sectionId: string): BuilderLayout {
  if (layout.sections.length === 1) return layout;
  const removed = layout.sections.find((section) => section.id === sectionId);
  const remaining = layout.sections.filter((section) => section.id !== sectionId);
  return { ...layout, sections: [{ ...remaining[0], placements: [...remaining[0].placements, ...(removed?.placements ?? [])] }, ...remaining.slice(1)] };
}

export function movePlacement(layout: BuilderLayout, fieldPath: string, sectionId: string): BuilderLayout {
  const placement = layout.sections.flatMap((section) => section.placements).find((item) => item.fieldPath === fieldPath) ?? { fieldPath, columnSpan: 1 as LayoutSpan };
  return { ...layout, sections: layout.sections.map((section) => ({ ...section, placements: section.id === sectionId ? [...section.placements.filter((item) => item.fieldPath !== fieldPath), placement] : section.placements.filter((item) => item.fieldPath !== fieldPath) })) };
}

export function setPlacementSpan(layout: BuilderLayout, fieldPath: string, span: LayoutSpan): BuilderLayout {
  return { ...layout, sections: layout.sections.map((section) => ({ ...section, placements: section.placements.map((item) => item.fieldPath === fieldPath ? { ...item, columnSpan: Math.min(section.columns, span) as LayoutSpan } : item) })) };
}

export interface LayoutHistory { present: BuilderLayout; past: readonly BuilderLayout[]; future: readonly BuilderLayout[] }
export type LayoutAction = { type: 'commit'; layout: BuilderLayout } | { type: 'replace'; layout: BuilderLayout } | { type: 'undo' } | { type: 'redo' };
export const initialLayoutHistory = (layout: BuilderLayout): LayoutHistory => ({ present: layout, past: [], future: [] });
export function layoutReducer(state: LayoutHistory, action: LayoutAction): LayoutHistory {
  if (action.type === 'replace') return { ...state, present: action.layout };
  if (action.type === 'commit') return { present: action.layout, past: [...state.past.slice(-49), state.present], future: [] };
  if (action.type === 'undo' && state.past.length) return { present: state.past.at(-1)!, past: state.past.slice(0, -1), future: [state.present, ...state.future] };
  if (action.type === 'redo' && state.future.length) return { present: state.future[0], past: [...state.past, state.present], future: state.future.slice(1) };
  return state;
}

