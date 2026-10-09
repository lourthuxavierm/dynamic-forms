import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import type { FieldType, FormSchema } from '@dynamic-form-engine/core';
import { ArrowLeft, ArrowRight, Check, EllipsisVertical, Pencil, Plus, Redo2, Trash2, TriangleAlert, Undo2, User, Users, Workflow } from 'lucide-react';
import { Button, IconButton, Menu } from '../../ui/Primitives';
import { allPaths } from '../../schema/operations';
import { FieldNode } from '../BuilderParts';
import { formDescription, formTitle } from '../formMeta';
import { addSection, initialLayoutHistory, layoutReducer, movePlacement, normalizeLayout, removeSection, setPlacementSpan, shiftPlacement, updateSection, type BuilderLayout, type LayoutColumns, type LayoutSpan } from '../layout';

const LAYOUT_KEY = 'dynamic-forms:builder:layout';

function loadLayout(schema: FormSchema): BuilderLayout {
  try {
    const saved = JSON.parse(localStorage.getItem(`${LAYOUT_KEY}:${schema.id}`) ?? 'null') as BuilderLayout | null;
    return normalizeLayout(schema, saved ?? undefined);
  } catch {
    return normalizeLayout(schema);
  }
}

export type CanvasViewport = 'desktop' | 'tablet' | 'mobile';

interface FormCanvasProps {
  schema: FormSchema;
  viewport: CanvasViewport;
  visiblePaths?: readonly string[];
  selectedPath?: string;
  errors: readonly { path: string; message: string }[];
  flowOpen: boolean;
  onToggleFlow: () => void;
  onMetaChange: (patch: { title?: string; description?: string }) => void;
  onSelect: (path: string) => void;
  onAdd: (type: FieldType, parentPath?: string) => void;
  onDrop: (event: DragEvent, parentPath: string) => void;
  onMove: (path: string, direction: -1 | 1) => void;
  onReparent: (path: string, parent: string) => void;
  onDuplicate: (path: string) => void;
  onRemove: (path: string) => void;
}

export function FormCanvas(props: FormCanvasProps) {
  const [history, dispatch] = useReducer(layoutReducer, props.schema, (schema) => initialLayoutHistory(loadLayout(schema)));
  const [activeId, setActiveId] = useState(history.present.sections[0]?.id);
  const [editingMeta, setEditingMeta] = useState(false);
  const fieldSignature = props.schema.fields.map((field) => field.name).join('|');
  const currentLayout = useRef(history.present);
  currentLayout.current = history.present;
  const sections = history.present.sections;
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId));
  const active = sections[activeIndex];
  const activeRef = useRef(active?.id);
  activeRef.current = active?.id;

  useEffect(() => {
    dispatch({ type: 'replace', layout: normalizeLayout(props.schema, currentLayout.current, activeRef.current) });
  }, [fieldSignature, props.schema]);
  useEffect(() => {
    try { localStorage.setItem(`${LAYOUT_KEY}:${props.schema.id}`, JSON.stringify(history.present)); } catch { /* storage unavailable */ }
  }, [history.present, props.schema.id]);
  // Follow the selection (e.g. from the Rules view) into the section that holds it.
  useEffect(() => {
    const root = props.selectedPath?.split('.')[0];
    const owner = root ? currentLayout.current.sections.find((section) => section.placements.some((placement) => placement.fieldPath === root)) : undefined;
    if (owner) setActiveId(owner.id);
  }, [props.selectedPath]);

  const fields = useMemo(() => new Map(props.schema.fields.map((field) => [field.name, field])), [props.schema.fields]);
  const commit = (layout: BuilderLayout) => dispatch({ type: 'commit', layout });
  const fieldCount = allPaths(props.schema).length;
  const title = formTitle(props.schema);
  const description = formDescription(props.schema);
  const move = (path: string, direction: -1 | 1) => { if (!path.includes('.')) commit(shiftPlacement(history.present, path, direction)); props.onMove(path, direction); };
  const createSection = () => { const next = addSection(history.present); commit(next); setActiveId(next.sections.at(-1)!.id); };

  return <main className={`canvas visual-canvas visual-canvas--${props.viewport}`}>
    <div className="form-surface">
      <header className="form-header-card">
        <span className="form-header-icon" aria-hidden="true"><Users size={30} /></span>
        {editingMeta ? <div className="form-header-copy editing">
          <input aria-label="Form title" autoFocus value={title} onChange={(event) => props.onMetaChange({ title: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') setEditingMeta(false); }} />
          <input aria-label="Form description" value={description} placeholder="Add a form description" onChange={(event) => props.onMetaChange({ description: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') setEditingMeta(false); }} />
        </div> : <div className="form-header-copy"><h1>{title}</h1><p>{description || 'Add a form description'}</p></div>}
        <div className="form-header-actions">
          <span className="count-pill">{fieldCount} {fieldCount === 1 ? 'field' : 'fields'}</span>
          <IconButton aria-label={editingMeta ? 'Finish editing form details' : 'Edit form details'} onClick={() => setEditingMeta((value) => !value)}>{editingMeta ? <Check size={19} /> : <Pencil size={19} />}</IconButton>
          <Menu label="Form layout options" trigger={<EllipsisVertical size={19} />} triggerClassName="ui-icon-button" items={[
            { label: 'Add section', icon: <Plus size={16} />, onSelect: createSection },
            { label: props.flowOpen ? 'Hide form flow' : 'Form flow & wizard', icon: <Workflow size={16} />, onSelect: props.onToggleFlow },
            { label: 'Undo layout', icon: <Undo2 size={16} />, disabled: !history.past.length, onSelect: () => dispatch({ type: 'undo' }) },
            { label: 'Redo layout', icon: <Redo2 size={16} />, disabled: !history.future.length, onSelect: () => dispatch({ type: 'redo' }) },
          ]} />
        </div>
      </header>
      {props.errors.length ? <button type="button" className="surface-issue" onClick={() => props.onSelect(props.errors[0].path)}>
        <TriangleAlert size={17} aria-hidden="true" /><span>{props.errors.length} schema {props.errors.length === 1 ? 'issue' : 'issues'} found: {props.errors[0].message}</span><strong>View details <ArrowRight size={15} aria-hidden="true" /></strong>
      </button> : null}
      <div className="form-steps" role="tablist" aria-label="Form sections">
        {sections.map((section, index) => <button type="button" role="tab" key={section.id} aria-selected={section.id === active.id} className={section.id === active.id ? 'form-step active' : 'form-step'} onClick={() => setActiveId(section.id)}>
          <b>{index + 1}</b><span><strong>{section.title}</strong><small>{section.description || `${section.placements.length} ${section.placements.length === 1 ? 'field' : 'fields'}`}</small></span>
        </button>)}
        <IconButton className="add-step" aria-label="Add section" title="Add section" onClick={createSection}><Plus size={18} /></IconButton>
      </div>
      {active ? <section className="form-section" key={active.id} aria-label={active.title}>
        <header className="form-section-header">
          <span className="section-icon" aria-hidden="true"><User size={22} /></span>
          <div className="section-copy">
            <input aria-label={`${active.title} section title`} value={active.title} onChange={(event) => commit(updateSection(history.present, active.id, { title: event.target.value }))} />
            <input aria-label={`${active.title} section description`} value={active.description ?? ''} placeholder="Section description" onChange={(event) => commit(updateSection(history.present, active.id, { description: event.target.value || undefined }))} />
          </div>
          <label className="section-columns"><span>Columns</span><select aria-label={`${active.title} columns`} value={active.columns} onChange={(event) => commit(updateSection(history.present, active.id, { columns: Number(event.target.value) as LayoutColumns }))}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
          <IconButton size="small" className="danger" aria-label={`Delete ${active.title} section`} title="Delete section" disabled={sections.length === 1} onClick={() => { commit(removeSection(history.present, active.id)); setActiveId(sections[0].id === active.id ? sections[1]?.id : sections[0].id); }}><Trash2 size={17} /></IconButton>
        </header>
        <div className="section-grid" role="tree" aria-label="Form fields" style={{ '--section-columns': active.columns } as CSSProperties}>
          {active.placements.map((placement) => {
            const field = fields.get(placement.fieldPath);
            if (!field || (props.visiblePaths && !props.visiblePaths.includes(placement.fieldPath))) return null;
            const label = field.label ?? field.name;
            const footer = props.selectedPath === field.name && (active.columns > 1 || sections.length > 1) ? <div className="field-layout-actions" onClick={(event) => event.stopPropagation()}>
              {active.columns > 1 ? <label>Width <select aria-label={`${label} column span`} value={placement.columnSpan} onChange={(event) => commit(setPlacementSpan(history.present, field.name, Number(event.target.value) as LayoutSpan))}>{Array.from({ length: active.columns }, (_, index) => index + 1).map((span) => <option key={span} value={span}>{span} of {active.columns}</option>)}</select></label> : null}
              {sections.length > 1 ? <label>Section <select aria-label={`Move ${label} to section`} value={active.id} onChange={(event) => commit(movePlacement(history.present, field.name, event.target.value))}>{sections.map((target) => <option key={target.id} value={target.id}>{target.title}</option>)}</select></label> : null}
            </div> : undefined;
            return <div className="visual-field" key={placement.fieldPath} style={{ '--field-span': placement.columnSpan } as CSSProperties}>
              <FieldNode field={field} path={field.name} footer={footer} selectedPath={props.selectedPath} onSelect={props.onSelect} onAdd={props.onAdd} onDrop={props.onDrop} onMove={move} onReparent={props.onReparent} onDuplicate={props.onDuplicate} onRemove={props.onRemove} />
            </div>;
          })}
          <button type="button" className="section-drop-zone" onClick={() => props.onAdd('text')} onDragOver={(event) => event.preventDefault()} onDrop={(event) => props.onDrop(event, '')}>
            <span className="drop-icon" aria-hidden="true"><Plus size={20} /></span>
            <span><strong>Drag fields here or click to add</strong><small>Drop fields from the left panel to build your form</small></span>
          </button>
        </div>
      </section> : null}
      <footer className="step-footer">
        <Button className="step-previous" disabled={activeIndex === 0} onClick={() => setActiveId(sections[activeIndex - 1]?.id)}><ArrowLeft size={17} aria-hidden="true" />Previous</Button>
        <Button variant="primary" className="step-next" disabled={activeIndex >= sections.length - 1} onClick={() => setActiveId(sections[activeIndex + 1]?.id)}>Next<ArrowRight size={17} aria-hidden="true" /></Button>
      </footer>
    </div>
  </main>;
}
