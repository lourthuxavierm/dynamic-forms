import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import type { FieldSchema, FieldType, FormSchema } from '@dynamic-form-engine/core';
import { Button, IconButton } from '../../ui/Primitives';
import { allPaths } from '../../schema/operations';
import { FieldNode } from '../BuilderParts';
import { addSection, initialLayoutHistory, layoutReducer, movePlacement, normalizeLayout, removeSection, setPlacementSpan, updateSection, type BuilderLayout, type LayoutColumns, type LayoutSpan } from '../layout';

const LAYOUT_KEY = 'dynamic-forms:builder:layout';

function loadLayout(schema: FormSchema): BuilderLayout {
  try {
    const saved = JSON.parse(localStorage.getItem(`${LAYOUT_KEY}:${schema.id}`) ?? 'null') as BuilderLayout | null;
    return normalizeLayout(schema, saved ?? undefined);
  } catch {
    return normalizeLayout(schema);
  }
}

interface FormCanvasProps {
  schema: FormSchema;
  visiblePaths?: readonly string[];
  selectedPath?: string;
  errors: readonly { path: string; message: string }[];
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
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const canvasRef = useRef<HTMLElement>(null);
  const fieldSignature = props.schema.fields.map((field) => field.name).join('|');

  useEffect(() => {
    dispatch({ type: 'replace', layout: normalizeLayout(props.schema, history.present) });
  }, [fieldSignature]);
  useEffect(() => {
    localStorage.setItem(`${LAYOUT_KEY}:${props.schema.id}`, JSON.stringify(history.present));
  }, [history.present, props.schema.id]);

  const fields = useMemo(() => new Map(props.schema.fields.map((field) => [field.name, field])), [props.schema.fields]);
  const commit = (layout: BuilderLayout) => dispatch({ type: 'commit', layout });

  return <main ref={canvasRef} className={`canvas visual-canvas visual-canvas--${viewport}`}>
    <div className="canvas-toolbar"><span className="layout-label">Form Layout</span>
      <div className="canvas-heading"><div><p className="eyebrow">Form canvas</p><h1>{humanize(props.schema.id)}</h1><p>Collect and manage customer information</p></div><span>{allPaths(props.schema).length} fields</span></div>
      <div className="canvas-viewport" aria-label="Canvas viewport">
        {(['desktop','tablet','mobile'] as const).map((item) => <Button key={item} size="small" variant="ghost" aria-label={`${item} canvas`} aria-pressed={viewport === item} className={viewport === item ? 'active' : ''} onClick={() => setViewport(item)}>{item === 'desktop' ? '▱' : item === 'tablet' ? '▯' : '▯'}</Button>)}
        <IconButton size="small" aria-label="Fullscreen canvas" onClick={() => void canvasRef.current?.requestFullscreen?.()}>⛶</IconButton>
      </div>
    </div>
    {props.errors.length ? <details className="error-list"><summary>{props.errors.length} schema issues</summary><ul>{props.errors.map((error, index) => <li key={index}><button onClick={() => props.onSelect(error.path)}>{error.path}</button>: {error.message}</li>)}</ul></details> : null}
    <div className="layout-history">
      <Button size="small" variant="ghost" disabled={!history.past.length} onClick={() => dispatch({ type: 'undo' })}>Undo layout</Button>
      <Button size="small" variant="ghost" disabled={!history.future.length} onClick={() => dispatch({ type: 'redo' })}>Redo layout</Button>
      <Button size="small" onClick={() => commit(addSection(history.present))}>＋ Add section</Button>
    </div>
    <div className="form-surface">
      <div className="form-surface-header"><span aria-hidden="true">👥</span><div><h2>{humanize(props.schema.id)}</h2><p>Collect and manage customer information</p></div><div className="surface-badges"><b>{props.schema.fields.length} fields</b>{props.errors.length ? <strong>{props.errors.length} issue</strong> : null}<i>⋮</i></div></div>
      <div className="form-steps" aria-label="Form steps">
        <div className="form-step active"><b>1</b><span><strong>Personal Details</strong><small>Basic information</small></span></div>
        <div className="form-step"><b>2</b><span><strong>Contact &amp; Preferences</strong><small>How to reach you</small></span></div>
        <div className="form-step"><b>3</b><span><strong>Additional Info</strong><small>Optional details</small></span></div>
      </div>
      {props.errors.length ? <button className="surface-issue" onClick={() => props.onSelect(props.errors[0].path)}><span>&#9888;&nbsp;&nbsp; {props.errors.length} schema issue found</span><strong>View details&nbsp;&nbsp; &#8594;</strong></button> : null}      {history.present.sections.map((section) => <section className="form-section" key={section.id} aria-label={section.title}>
        <header className="form-section-header">
          <span className="section-icon" aria-hidden="true">♟</span>
          <div className="section-copy">
            <input aria-label={`${section.title} section title`} value={section.title} onChange={(event) => commit(updateSection(history.present, section.id, { title: event.target.value }))} />
            <input aria-label={`${section.title} section description`} value={section.description ?? ''} placeholder="Section description" onChange={(event) => commit(updateSection(history.present, section.id, { description: event.target.value || undefined }))} />
          </div>
          <span className="section-count">{section.placements.length} fields</span><label className="section-columns"><span>Columns</span><select aria-label={`${section.title} columns`} value={section.columns} onChange={(event) => commit(updateSection(history.present, section.id, { columns: Number(event.target.value) as LayoutColumns }))}>{[1,2,3,4].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
          <IconButton size="small" aria-label={`Delete ${section.title} section`} disabled={history.present.sections.length === 1} onClick={() => commit(removeSection(history.present, section.id))}>⌫</IconButton>
        </header>
        <div className="section-grid" role="tree" aria-label="Form fields" style={{ '--section-columns': section.columns } as CSSProperties}>
          {section.placements.map((placement) => {
            const field = fields.get(placement.fieldPath);
            if (!field || (props.visiblePaths && !props.visiblePaths.includes(placement.fieldPath))) return null;
            return <div className="visual-field" key={placement.fieldPath} style={{ '--field-span': placement.columnSpan } as CSSProperties}>
              <FieldPreview field={field} />
              <FieldNode field={field} path={field.name} selectedPath={props.selectedPath} onSelect={props.onSelect} onAdd={props.onAdd} onDrop={props.onDrop} onMove={props.onMove} onReparent={props.onReparent} onDuplicate={props.onDuplicate} onRemove={props.onRemove} />
              <div className="field-layout-actions">
                <label>Span <select aria-label={`${field.label ?? field.name} column span`} value={placement.columnSpan} onChange={(event) => commit(setPlacementSpan(history.present, field.name, Number(event.target.value) as LayoutSpan))}>{Array.from({ length: section.columns }, (_, index) => index + 1).map((span) => <option key={span}>{span}</option>)}</select></label>
                {history.present.sections.length > 1 ? <label>Section <select aria-label={`Move ${field.label ?? field.name} to section`} value={section.id} onChange={(event) => commit(movePlacement(history.present, field.name, event.target.value))}>{history.present.sections.map((target) => <option key={target.id} value={target.id}>{target.title}</option>)}</select></label> : null}
              </div>
            </div>;
          })}
          <button className="section-drop-zone" onClick={() => props.onAdd('text')} onDragOver={(event) => event.preventDefault()} onDrop={(event) => props.onDrop(event, '')}>＋ Drag fields here or click to add</button>
        </div>
      </section>)}
    </div>
  </main>;
}

function FieldPreview({ field }: { field: FieldSchema }) {
  if (field.type === 'textarea') return <textarea tabIndex={-1} aria-hidden="true" placeholder={field.placeholder ?? 'Enter additional details…'} readOnly />;
  if (['select','multi-select','autocomplete','async-autocomplete','tree-select'].includes(field.type)) return <div className="field-preview-control">{field.placeholder ?? 'Select an option'}<span>⌄</span></div>;
  if (['checkbox','switch','toggle-button'].includes(field.type)) return <div className="field-preview-choice"><span className="preview-switch" /> Enabled</div>;
  if (['radio','radio-group','checkbox-group'].includes(field.type)) return <div className="field-preview-choice"><span>○ Option one</span><span>○ Option two</span></div>;
  return <div className="field-preview-control"><span aria-hidden="true">{field.type === 'email' ? '✉' : field.type === 'phone' ? '☎' : field.type === 'number' ? '#' : '●'}</span>{field.placeholder ?? `Enter ${(field.label ?? field.name).toLowerCase()}`}</div>;
}

function humanize(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase()) || 'Untitled form';
}



