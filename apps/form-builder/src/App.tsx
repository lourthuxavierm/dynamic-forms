import { useEffect, useMemo, useReducer, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import type { FieldSchema, FieldType, FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { HtmlForm } from '@dynamic-form-engine/react-html';
import { initialState, reducer } from './builder/reducer';
import { clearDraft, loadDraft, saveDraft, starterSchema } from './persistence/draft';
import { createField, palette } from './schema/catalogue';
import { parseSchema, validateBuilderSchema } from './schema/builderValidation';
import { DropZone, FieldNode, Inspector, Palette } from './builder/BuilderParts';
import { Preview } from './preview/Preview';
import { NavigationRail, TopBar } from './app/Shell';
import { allPaths, duplicateField, fieldsAt, findField, insertField, moveField, moveToParent, removeField, uniqueName, updateField } from './schema/operations';

const loaded = loadDraft();
export default function App() {
  const [state, dispatch] = useReducer(reducer, loaded.schema, initialState);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(loaded.schema, null, 2));
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<Readonly<Record<string, unknown>>>();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [density, setDensity] = useState<'compact' | 'standard' | 'comfortable'>('standard');
  const [scheme, setScheme] = useState<'light' | 'dark' | 'auto'>('light');
  const uploadRef = useRef<HTMLInputElement>(null);
  const errors = useMemo(() => validateBuilderSchema(state.schema), [state.schema]);
  const selected = state.selectedPath ? findField(state.schema, state.selectedPath)?.field : undefined;
  const commit = (schema: FormSchema, selectedPath?: string, message?: string) => dispatch({ type: 'commit', schema, selectedPath, message });

  useEffect(() => { const timer = window.setTimeout(() => { saveDraft(state.schema, state.selectedPath); dispatch({ type: 'saved' }); }, 350); return () => window.clearTimeout(timer); }, [state.schema, state.selectedPath]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const editing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); dispatch({ type: event.shiftKey ? 'redo' : 'undo' }); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); dispatch({ type: 'redo' }); }
      if (!editing && event.key === 'Delete' && state.selectedPath) { event.preventDefault(); remove(state.selectedPath); }
      if (!editing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && state.selectedPath) { event.preventDefault(); duplicate(state.selectedPath); }
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  });

  const add = (type: FieldType, parentPath = '') => {
    const name = uniqueName(state.schema, parentPath, type.replace(/-(.)/g, (_, char: string) => char.toUpperCase()));
    const schema = insertField(state.schema, parentPath, createField(type, name));
    const path = parentPath ? `${parentPath}.${name}` : name;
    commit(schema, path, `${type} field added`);
  };
  const patchSelected = (patch: Partial<FieldSchema>) => {
    if (!state.selectedPath || !selected) return;
    const oldPath = state.selectedPath;
    const schema = updateField(state.schema, oldPath, patch);
    const path = patch.name ? [...oldPath.split('.').slice(0, -1), patch.name].join('.') : oldPath;
    commit(schema, path, 'Field updated');
  };
  const remove = (path: string) => { const location = findField(state.schema, path); if (!location) return; const siblings = fieldsAt(state.schema, location.parentPath); const fallback = siblings[location.index + 1] ?? siblings[location.index - 1]; commit(removeField(state.schema, path), fallback ? (location.parentPath ? `${location.parentPath}.${fallback.name}` : fallback.name) : location.parentPath || undefined, 'Field deleted'); };
  const duplicate = (path: string) => { const result = duplicateField(state.schema, path); commit(result.schema, result.path, 'Field duplicated'); };
  const reorder = (path: string, direction: -1 | 1) => { const location = findField(state.schema, path); if (location) commit(moveField(state.schema, path, location.index + direction), path, 'Field moved'); };
  const reparent = (path: string, parentPath: string) => { const result = moveToParent(state.schema, path, parentPath); commit(result.schema, result.path, 'Field moved'); };
  const onDrop = (event: DragEvent, parentPath: string) => { event.preventDefault(); event.stopPropagation(); const paletteType = event.dataTransfer.getData('application/x-builder-field') as FieldType; const movingPath = event.dataTransfer.getData('application/x-builder-path'); if (palette.some((item) => item.type === paletteType)) add(paletteType, parentPath); else if (movingPath) reparent(movingPath, parentPath); };

  const chooseView = (view: typeof state.view) => { if (view === 'json') setJsonText(JSON.stringify(state.schema, null, 2)); dispatch({ type: 'view', view }); };
  const applyJson = () => { const result = parseSchema(jsonText); if (!result.schema || result.errors.length) { setJsonErrors(result.errors.map((error) => `${error.path}: ${error.message}`)); return; } setJsonErrors([]); commit(result.schema, result.schema.fields[0]?.name, 'JSON applied'); };
  const copy = async () => { await navigator.clipboard.writeText(JSON.stringify(state.schema, null, 2)); dispatch({ type: 'message', message: errors.length ? 'Invalid schema copied with warnings' : 'Schema copied' }); };
  const download = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(state.schema, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${state.schema.id || 'form'}.json`; anchor.click(); URL.revokeObjectURL(url); dispatch({ type: 'message', message: 'Schema downloaded' }); };
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const text = await file.text(); const result = parseSchema(text); if (!result.schema || result.errors.length) { dispatch({ type: 'message', message: result.errors.map((error) => error.message).join(', ') }); return; } if (!state.saved && !confirm('Replace the current unsaved form?')) return; commit(result.schema, result.schema.fields[0]?.name, 'Schema imported'); event.target.value = ''; };
  const newForm = () => { if (!state.saved && !confirm('Discard the current unsaved form?')) return; clearDraft(); const schema = { ...starterSchema, id: 'untitled-form', fields: [] }; commit(schema, undefined, 'New form created'); };

  return <div className="app">
    <TopBar
      schema={state.schema}
      issueCount={errors.length}
      saved={state.saved}
      canUndo={Boolean(state.past.length)}
      canRedo={Boolean(state.future.length)}
      uploadRef={uploadRef}
      onSchemaChange={(schema) => commit(schema, state.selectedPath)}
      onUndo={() => dispatch({ type: 'undo' })}
      onRedo={() => dispatch({ type: 'redo' })}
      onNew={newForm}
      onImport={(event) => void importFile(event)}
      onExport={download}
      onCopy={() => void copy()}
    />
    <div className="app-body">
      <NavigationRail onNavigate={(label) => label !== 'Builder' && dispatch({ type: 'message', message: label + ' is planned for a later phase' })} />
      <div className="app-content">
    <nav className="tabs" aria-label="Builder view">{(['design','preview','json'] as const).map((view) => <button key={view} className={state.view === view ? 'active' : ''} onClick={() => chooseView(view)}>{view}</button>)}</nav>
    {state.view === 'design' ? <div className="workspace">
      <Palette onAdd={add} />
      <main className="canvas" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, '')}>
        <div className="canvas-heading"><div><p className="eyebrow">Form canvas</p><h1>{humanize(state.schema.id)}</h1></div><span>{allPaths(state.schema).length} fields</span></div>
        {errors.length ? <details className="error-list"><summary>{errors.length} schema issues</summary><ul>{errors.map((error, index) => <li key={index}><button onClick={() => dispatch({ type: 'select', path: error.path })}>{error.path}</button>: {error.message}</li>)}</ul></details> : null}
        <div className="tree" role="tree" aria-label="Form fields">{state.schema.fields.map((field) => <FieldNode key={field.name} field={field} path={field.name} selectedPath={state.selectedPath} onSelect={(path) => dispatch({ type: 'select', path })} onAdd={add} onDrop={onDrop} onMove={reorder} onReparent={reparent} onDuplicate={duplicate} onRemove={remove} />)}</div>
        <DropZone label="Drop or add a root field" onAdd={() => add('text')} onDrop={(event) => onDrop(event, '')} />
      </main>
      <Inspector schema={state.schema} path={state.selectedPath} field={selected} errors={errors.filter((error) => error.path === state.selectedPath)} onPatch={patchSelected} onReparent={(parent) => state.selectedPath && reparent(state.selectedPath, parent)} />
    </div> : null}
    {state.view === 'preview' ? <Preview schema={state.schema} errors={errors} submitted={submitted} onSubmitted={setSubmitted} viewport={viewport} setViewport={setViewport} density={density} setDensity={setDensity} scheme={scheme} setScheme={setScheme} /> : null}
    {state.view === 'json' ? <main className="json-view"><div className="view-heading"><div><p className="eyebrow">Portable schema</p><h1>JSON editor</h1></div><div><button onClick={() => { setJsonText(JSON.stringify(state.schema, null, 2)); setJsonErrors([]); }}>Discard edits</button><button className="primary" onClick={applyJson}>Apply JSON</button></div></div>{jsonErrors.length ? <div className="json-errors" role="alert">{jsonErrors.map((error) => <p key={error}>{error}</p>)}</div> : null}<textarea aria-label="Schema JSON" spellCheck={false} value={jsonText} onChange={(event) => setJsonText(event.target.value)} /></main> : null}
      </div>
    </div>
    <div className="live-region" aria-live="polite">{state.message}</div>
  </div>;
}

function safeName(value: string) { return value.replace(/[^a-zA-Z0-9]+(.)?/g, (_, char: string | undefined) => char?.toUpperCase() ?? '').replace(/^[A-Z]/, (char) => char.toLowerCase()); }
function humanize(value: string) { return value.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase()) || 'Untitled form'; }



