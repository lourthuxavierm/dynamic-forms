import { useEffect, useMemo, useReducer, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react';
import type { ConditionOperator, DataSourceConfig, FieldCondition, FieldSchema, FieldType, FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormProvider } from '@lourthuxavierm/dynamic-forms-react';
import { HtmlForm } from '@lourthuxavierm/dynamic-forms-react-html';
import { initialState, reducer } from './builder/reducer';
import { clearDraft, loadDraft, saveDraft, starterSchema } from './persistence/draft';
import { createField, hasOptions, isNumeric, isTextual, palette } from './schema/catalogue';
import { parseSchema, validateBuilderSchema } from './schema/builderValidation';
import { allPaths, duplicateField, fieldsAt, findField, insertField, moveField, moveToParent, normalizeType, removeField, structural, uniqueName, updateField } from './schema/operations';

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
    <header className="topbar">
      <div className="brand"><span>DF</span><div><strong>Dynamic Forms</strong><small>Schema builder</small></div></div>
      <label className="document-field"><span>Form ID</span><input value={state.schema.id} onChange={(event) => commit({ ...state.schema, id: event.target.value }, state.selectedPath)} /></label>
      <label className="version-field"><span>Version</span><input value={state.schema.version ?? ''} onChange={(event) => commit({ ...state.schema, version: event.target.value || undefined }, state.selectedPath)} /></label>
      <span className={errors.length ? 'schema-status invalid' : 'schema-status valid'}>{errors.length ? `${errors.length} issue${errors.length === 1 ? '' : 's'}` : state.saved ? 'Saved' : 'Saving...'}</span>
      <div className="header-actions"><button onClick={() => dispatch({ type: 'undo' })} disabled={!state.past.length} aria-label="Undo">Undo</button><button onClick={() => dispatch({ type: 'redo' })} disabled={!state.future.length} aria-label="Redo">Redo</button><button onClick={newForm}>New</button><button onClick={() => uploadRef.current?.click()}>Import</button><input ref={uploadRef} hidden type="file" accept=".json,application/json" onChange={(event) => void importFile(event)} /><button onClick={download}>Download</button><button className="primary" onClick={() => void copy()}>Copy JSON</button></div>
    </header>
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
    <div className="live-region" aria-live="polite">{state.message}</div>
  </div>;
}

function Palette({ onAdd }: { onAdd: (type: FieldType) => void }) {
  const groups = [...new Set(palette.map((item) => item.group))];
  return <aside className="palette-panel"><h2>Fields</h2><p>Drag or click to add</p>{groups.map((group) => <section key={group}><h3>{group}</h3><div className="palette-grid">{palette.filter((item) => item.group === group).map((item) => <button key={item.type} aria-label={item.label} draggable onDragStart={(event) => event.dataTransfer.setData('application/x-builder-field', item.type)} onClick={() => onAdd(item.type)}><span aria-hidden="true">{item.label.slice(0, 2)}</span>{item.label}</button>)}</div></section>)}</aside>;
}

interface NodeProps {
  field: FieldSchema; path: string; selectedPath?: string;
  onSelect: (path: string) => void; onAdd: (type: FieldType, parentPath?: string) => void; onDrop: (event: DragEvent, parentPath: string) => void;
  onMove: (path: string, direction: -1 | 1) => void; onReparent: (path: string, parent: string) => void;
  onDuplicate: (path: string) => void; onRemove: (path: string) => void;
}
function FieldNode(props: NodeProps) {
  const { field, path } = props; const parentPath = path.split('.').slice(0, -1).join('.');
  return <div className="node-wrap" role="treeitem" aria-selected={props.selectedPath === path}>
    <article className={props.selectedPath === path ? 'field-node selected' : 'field-node'} onClick={() => props.onSelect(path)} draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData('application/x-builder-path', path); }}>
      <button className="handle" aria-label={`Select ${field.label ?? field.name}`}>:</button>
      <div className="field-summary"><strong>{field.label ?? field.name}{field.validation?.required ? ' *' : ''}</strong><small>{field.type} / {path}</small><div className="badges">{field.visibleWhen || field.disabledWhen || field.requiredWhen ? <span>conditional</span> : null}{field.dependsOn?.length ? <span>dependent</span> : null}{field.dataSource ? <span>data</span> : null}</div></div>
      <div className="node-actions"><button title="Move up" aria-label="Move up" onClick={(event) => { event.stopPropagation(); props.onMove(path, -1); }}>Up</button><button title="Move down" aria-label="Move down" onClick={(event) => { event.stopPropagation(); props.onMove(path, 1); }}>Down</button>{parentPath ? <button title="Move to root" onClick={(event) => { event.stopPropagation(); props.onReparent(path, ''); }}>Out</button> : null}<button title="Duplicate" onClick={(event) => { event.stopPropagation(); props.onDuplicate(path); }}>Copy</button><button className="danger" title="Delete" onClick={(event) => { event.stopPropagation(); props.onRemove(path); }}>Delete</button></div>
    </article>
    {structural(field) ? <div className="children" role="group">{field.fields?.map((child) => <FieldNode {...props} key={child.name} field={child} path={`${path}.${child.name}`} />)}<DropZone label={`Add child to ${field.label ?? field.name}`} onAdd={() => props.onAdd('text', path)} onDrop={(event) => props.onDrop(event, path)} /></div> : null}
  </div>;
}
function DropZone({ label, onAdd, onDrop }: { label: string; onAdd: () => void; onDrop: (event: DragEvent) => void }) {
  return <button className="drop-zone" onClick={onAdd} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>{label}</button>;
}

interface InspectorProps { schema: FormSchema; path?: string; field?: FieldSchema; errors: readonly { message: string }[]; onPatch: (patch: Partial<FieldSchema>) => void; onReparent: (parent: string) => void }
function Inspector({ schema, path, field, errors, onPatch, onReparent }: InspectorProps) {
  const [metadata, setMetadata] = useState(''); const [config, setConfig] = useState('');
  useEffect(() => { setMetadata(field?.metadata ? JSON.stringify(field.metadata, null, 2) : ''); setConfig(field?.config ? JSON.stringify(field.config, null, 2) : ''); }, [path]);
  if (!field) return <aside className="inspector"><h2>Properties</h2><p>Select a field to edit it.</p></aside>;
  const parent = path?.split('.').slice(0, -1).join('.') ?? ''; const siblings = fieldsAt(schema, parent);
  const patchJson = (key: 'metadata' | 'config', text: string) => { try { onPatch({ [key]: text.trim() ? JSON.parse(text) : undefined }); } catch { /* retain working text */ } };
  return <aside className="inspector"><div className="inspector-heading"><h2>Properties</h2><span>{field.type}</span></div>{errors.map((error) => <p className="field-error" key={error.message}>{error.message}</p>)}<div className="property-list">
    <Section title="General" open><Control label="Label"><input value={field.label ?? ''} onChange={(event) => onPatch({ label: event.target.value })} /></Control><Control label="Name"><input value={field.name} onChange={(event) => onPatch({ name: safeName(event.target.value) })} /></Control><Control label="Type"><select value={field.type} onChange={(event) => onPatch(normalizeType(field, event.target.value))}>{palette.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}</select></Control><Control label="Description"><textarea rows={2} value={field.description ?? ''} onChange={(event) => onPatch({ description: event.target.value || undefined })} /></Control><Control label="Placeholder"><input value={field.placeholder ?? ''} onChange={(event) => onPatch({ placeholder: event.target.value || undefined })} /></Control><Control label="Default value"><input value={typeof field.defaultValue === 'string' || typeof field.defaultValue === 'number' ? String(field.defaultValue) : ''} onChange={(event) => onPatch({ defaultValue: event.target.value || undefined })} /></Control><Toggle label="Disabled" checked={field.disabled ?? false} onChange={(disabled) => onPatch({ disabled })} /><Toggle label="Read only" checked={field.readOnly ?? false} onChange={(readOnly) => onPatch({ readOnly })} /></Section>
    <Section title="Validation"><Toggle label="Required" checked={field.validation?.required ?? false} onChange={(required) => onPatch({ validation: { ...field.validation, required } })} />{isTextual(field.type) ? <><NumberControl label="Minimum length" value={field.validation?.minLength} onChange={(minLength) => onPatch({ validation: { ...field.validation, minLength } })} /><NumberControl label="Maximum length" value={field.validation?.maxLength} onChange={(maxLength) => onPatch({ validation: { ...field.validation, maxLength } })} /><Control label="Pattern"><input value={field.validation?.pattern ?? ''} onChange={(event) => onPatch({ validation: { ...field.validation, pattern: event.target.value || undefined } })} /></Control></> : null}{isNumeric(field.type) ? <><NumberControl label="Minimum" value={field.validation?.min} onChange={(min) => onPatch({ validation: { ...field.validation, min } })} /><NumberControl label="Maximum" value={field.validation?.max} onChange={(max) => onPatch({ validation: { ...field.validation, max } })} /></> : null}{field.type === 'array' ? <><NumberControl label="Minimum items" value={field.validation?.minItems} onChange={(minItems) => onPatch({ validation: { ...field.validation, minItems } })} /><NumberControl label="Maximum items" value={field.validation?.maxItems} onChange={(maxItems) => onPatch({ validation: { ...field.validation, maxItems } })} /></> : null}</Section>
    {hasOptions(field.type) ? <Section title="Options" open><OptionEditor field={field} onPatch={onPatch} /></Section> : null}
    <Section title="Conditions & dependencies"><ConditionEditor label="Visible when" condition={field.visibleWhen} paths={allPaths(schema).filter((item) => item !== path)} onChange={(visibleWhen) => onPatch({ visibleWhen })} /><ConditionEditor label="Disabled when" condition={field.disabledWhen} paths={allPaths(schema).filter((item) => item !== path)} onChange={(disabledWhen) => onPatch({ disabledWhen })} /><ConditionEditor label="Required when" condition={field.requiredWhen} paths={allPaths(schema).filter((item) => item !== path)} onChange={(requiredWhen) => onPatch({ requiredWhen })} /><Control label="Dependencies (comma-separated)"><input value={field.dependsOn?.join(', ') ?? ''} onChange={(event) => onPatch({ dependsOn: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></Control><Toggle label="Reset on dependency change" checked={field.resetOnDependencyChange ?? false} onChange={(resetOnDependencyChange) => onPatch({ resetOnDependencyChange })} /><Control label="Hidden value policy"><select value={field.hiddenValuePolicy ?? 'preserve'} onChange={(event) => onPatch({ hiddenValuePolicy: event.target.value as FieldSchema['hiddenValuePolicy'] })}><option value="preserve">Preserve</option><option value="clear">Clear</option><option value="reset">Reset</option></select></Control></Section>
    {hasOptions(field.type) ? <Section title="Data source"><DataSourceEditor value={field.dataSource} onChange={(dataSource) => onPatch({ dataSource })} /></Section> : null}
    <Section title="Structure"><Control label="Parent"><select value={parent} onChange={(event) => onReparent(event.target.value)}><option value="">Form root</option>{allPaths(schema).filter((candidate) => candidate !== path && !candidate.startsWith(`${path}.`) && structural(findField(schema, candidate)!.field)).map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}</select></Control></Section>
    <Section title="Advanced"><Control label="Metadata JSON"><textarea rows={5} value={metadata} onChange={(event) => setMetadata(event.target.value)} onBlur={() => patchJson('metadata', metadata)} /></Control><Control label="Type config JSON"><textarea rows={5} value={config} onChange={(event) => setConfig(event.target.value)} onBlur={() => patchJson('config', config)} /></Control>{field.dataSource?.type === 'function' ? <p className="notice">Function data sources are preserved but cannot be edited or executed.</p> : null}<p className="muted">{siblings.length} sibling field{siblings.length === 1 ? '' : 's'}</p></Section>
  </div></aside>;
}

function Section({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) { return <details open={open}><summary>{title}</summary><div className="section-body">{children}</div></details>; }
function Control({ label, children }: { label: string; children: ReactNode }) { return <label className="control-label"><span>{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>; }
function NumberControl({ label, value, onChange }: { label: string; value?: number; onChange: (value?: number) => void }) { return <Control label={label}><input type="number" value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))} /></Control>; }

function OptionEditor({ field, onPatch }: { field: FieldSchema; onPatch: (patch: Partial<FieldSchema>) => void }) {
  const options = [...(field.options ?? [])];
  const update = (index: number, patch: Record<string, unknown>) => { options[index] = { ...options[index], ...patch }; onPatch({ options }); };
  return <div className="options">{options.map((option, index) => <div className="option-row" key={index}><input aria-label={`Option ${index + 1} label`} value={option.label} onChange={(event) => update(index, { label: event.target.value })} /><input aria-label={`Option ${index + 1} value`} value={String(option.value)} onChange={(event) => update(index, { value: event.target.value })} /><button aria-label="Move option up" disabled={!index} onClick={() => { [options[index - 1], options[index]] = [options[index], options[index - 1]]; onPatch({ options }); }}>Up</button><button aria-label="Delete option" onClick={() => onPatch({ options: options.filter((_, item) => item !== index) })}>X</button></div>)}<button onClick={() => onPatch({ options: [...options, { label: 'New option', value: `option${options.length + 1}` }] })}>Add option</button></div>;
}

const operators: readonly ConditionOperator[] = ['equals','notEquals','exists','notExists','contains','greaterThan','lessThan'];
function ConditionEditor({ label, condition, paths, onChange }: { label: string; condition?: FieldCondition; paths: string[]; onChange: (value?: FieldCondition) => void }) {
  const simple = condition && 'field' in condition ? condition : undefined;
  return <fieldset className="condition"><legend>{label}</legend><Toggle label="Enabled" checked={Boolean(condition)} onChange={(enabled) => onChange(enabled ? { field: paths[0] ?? '', operator: 'equals', value: '' } : undefined)} />{condition ? <><select aria-label={`${label} field`} value={simple?.field ?? ''} onChange={(event) => onChange({ field: event.target.value, operator: simple?.operator ?? 'equals', value: simple?.value })}><option value="">Select field</option>{paths.map((path) => <option key={path}>{path}</option>)}</select><select aria-label={`${label} operator`} value={simple?.operator ?? 'equals'} onChange={(event) => onChange({ field: simple?.field ?? '', operator: event.target.value as ConditionOperator, value: simple?.value })}>{operators.map((operator) => <option key={operator}>{operator}</option>)}</select><input aria-label={`${label} value`} value={String(simple?.value ?? '')} onChange={(event) => onChange({ field: simple?.field ?? '', operator: simple?.operator ?? 'equals', value: event.target.value })} /><small>Nested and/or/not groups remain editable in JSON view.</small></> : null}</fieldset>;
}

function DataSourceEditor({ value, onChange }: { value?: DataSourceConfig; onChange: (value?: DataSourceConfig) => void }) {
  const type = value?.type ?? 'none';
  return <div className="data-source"><Control label="Source type"><select value={type} onChange={(event) => { const next = event.target.value; onChange(next === 'none' ? undefined : next === 'static' ? { type: 'static', options: [] } : { type: 'url', url: '', method: 'GET' }); }}><option value="none">Schema options</option><option value="static">Static</option><option value="url">URL</option>{type === 'function' ? <option value="function">Function (read-only)</option> : null}</select></Control>{type === 'static' ? <Control label="Static options JSON"><textarea rows={4} value={JSON.stringify(value?.options ?? [], null, 2)} onChange={(event) => { try { onChange({ ...value, type: 'static', options: JSON.parse(event.target.value) }); } catch { /* wait for valid JSON */ } }} /></Control> : null}{type === 'url' ? <><Control label="URL"><input value={value?.url ?? ''} onChange={(event) => onChange({ ...value, type: 'url', url: event.target.value })} /></Control><Control label="Method"><select value={value?.method ?? 'GET'} onChange={(event) => onChange({ ...value, type: 'url', method: event.target.value as 'GET' | 'POST' })}><option>GET</option><option>POST</option></select></Control><Control label="Search parameter"><input value={value?.searchParam ?? ''} onChange={(event) => onChange({ ...value, type: 'url', searchParam: event.target.value || undefined })} /></Control><Toggle label="Cache results" checked={value?.cache ?? false} onChange={(cache) => onChange({ ...value, type: 'url', cache })} /></> : null}</div>;
}

function Preview({ schema, errors, submitted, onSubmitted, viewport, setViewport, density, setDensity, scheme, setScheme }: { schema: FormSchema; errors: readonly { path: string; message: string }[]; submitted?: Readonly<Record<string, unknown>>; onSubmitted: (values?: Readonly<Record<string, unknown>>) => void; viewport: 'desktop'|'tablet'|'mobile'; setViewport: (value: 'desktop'|'tablet'|'mobile') => void; density: 'compact'|'standard'|'comfortable'; setDensity: (value: 'compact'|'standard'|'comfortable') => void; scheme: 'light'|'dark'|'auto'; setScheme: (value: 'light'|'dark'|'auto') => void }) {
  const [run, setRun] = useState(0);
  return <main className="preview-view"><div className="preview-toolbar"><div>{(['desktop','tablet','mobile'] as const).map((item) => <button key={item} className={viewport === item ? 'active' : ''} onClick={() => setViewport(item)}>{item}</button>)}</div><label>Density <select value={density} onChange={(event) => setDensity(event.target.value as typeof density)}><option>compact</option><option>standard</option><option>comfortable</option></select></label><label>Theme <select value={scheme} onChange={(event) => setScheme(event.target.value as typeof scheme)}><option>light</option><option>dark</option><option>auto</option></select></label><button onClick={() => { setRun((value) => value + 1); onSubmitted(undefined); }}>Reset preview</button></div>{errors.length ? <div className="preview-errors" role="alert"><h2>Preview unavailable</h2><p>Resolve schema errors before rendering.</p><ul>{errors.map((error, index) => <li key={index}>{error.path}: {error.message}</li>)}</ul></div> : <div className={`preview-frame ${viewport}`}><div className="preview-card"><p className="eyebrow">Live preview</p><h1>{humanize(schema.id)}</h1><FormProvider key={`${JSON.stringify(schema)}-${run}`} schema={schema} onError={() => undefined}><HtmlForm schema={schema} density={density} colorScheme={scheme} submitLabel="Submit form" onSubmit={(values) => onSubmitted(values)} /></FormProvider>{submitted ? <section className="submitted"><h2>Submitted values</h2><pre>{JSON.stringify(submitted, null, 2)}</pre></section> : null}</div></div>}</main>;
}
function safeName(value: string) { return value.replace(/[^a-zA-Z0-9]+(.)?/g, (_, char: string | undefined) => char?.toUpperCase() ?? '').replace(/^[A-Z]/, (char) => char.toLowerCase()); }
function humanize(value: string) { return value.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase()) || 'Untitled form'; }
