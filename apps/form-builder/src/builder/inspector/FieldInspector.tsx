import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ConditionOperator, DataSourceConfig, FieldCondition, FieldSchema, FormSchema } from '@dynamic-form-engine/core';
import { hasOptions, isNumeric, isTextual, palette } from '../../schema/catalogue';
import { allPaths, fieldsAt, findField, normalizeType, structural } from '../../schema/operations';
import { Button, Switch } from '../../ui/Primitives';

type InspectorTab = 'properties' | 'validation' | 'logic' | 'appearance';

interface FieldInspectorProps {
  schema: FormSchema;
  path?: string;
  field?: FieldSchema;
  errors: readonly { message: string }[];
  onPatch: (patch: Partial<FieldSchema>) => void;
  onReparent: (parent: string) => void;
}

export function FieldInspector({ schema, path, field, errors, onPatch, onReparent }: FieldInspectorProps) {
  const [tab, setTab] = useState<InspectorTab>('properties');
  const [metadata, setMetadata] = useState('');
  const [config, setConfig] = useState('');
  const [appearanceDraft, setAppearanceDraft] = useState<Record<string, unknown>>({});
  const [messageDraft, setMessageDraft] = useState<Record<string, unknown>>({});
  const metadataRef = useRef<FieldSchema['metadata']>(field?.metadata);
  const metadataPathRef = useRef(path);
  useEffect(() => {
    const incoming = field?.metadata ?? {};
    const current = metadataPathRef.current === path ? metadataRef.current ?? {} : {};
    const merged = {
      ...incoming,
      ...current,
      appearance: { ...(incoming.appearance ?? {}), ...(current.appearance ?? {}) },
      validationMessages: { ...(incoming.validationMessages ?? {}), ...(current.validationMessages ?? {}) },
    };
    metadataPathRef.current = path;
    metadataRef.current = merged;
    setMetadata(Object.keys(merged).length ? JSON.stringify(merged, null, 2) : '');
    setConfig(field?.config ? JSON.stringify(field.config, null, 2) : '');
    setAppearanceDraft(merged.appearance as Record<string, unknown>);
    setMessageDraft(merged.validationMessages as Record<string, unknown>);
  }, [field?.config, field?.metadata, path]);
  if (!field) return <aside className="inspector inspector-empty"><h2>Field configuration</h2><p>Select a field to edit it.</p></aside>;

  const parent = path?.split('.').slice(0, -1).join('.') ?? '';
  const siblings = fieldsAt(schema, parent);
  const paths = allPaths(schema).filter((item) => item !== path);
  const appearance = appearanceDraft;
  const validationMessages = messageDraft;
  const patchMetadataGroup = (key: 'appearance' | 'validationMessages', name: string, value?: unknown) => {
    const metadata = metadataRef.current ?? {};
    const current = (metadata[key] ?? {}) as Record<string, unknown>;
    const nextGroup = { ...current, [name]: value };
    const nextMetadata = { ...metadata, [key]: nextGroup };
    metadataRef.current = nextMetadata;
    if (key === 'appearance') setAppearanceDraft(nextGroup); else setMessageDraft(nextGroup);
    onPatch({ metadata: nextMetadata });
  };  const patchJson = (key: 'metadata' | 'config', text: string) => {
    try { onPatch({ [key]: text.trim() ? JSON.parse(text) : undefined }); } catch { /* retain invalid working text */ }
  };
  const changeType = (type: string) => {
    const destructive = type !== field.type && Boolean(field.options?.length || field.fields?.length || field.config);
    if (!destructive || window.confirm('Changing the field type may remove incompatible configuration. Continue?')) onPatch(normalizeType(field, type));
  };

  return <aside className="inspector">

    <div className="inspector-tabs" role="tablist" aria-label="Field inspector">
      {(['properties','validation','logic','appearance'] as const).map((item) => <Button key={item} size="small" variant="ghost" role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item === 'properties' ? 'Field' : item === 'appearance' ? 'Styles' : item}</Button>)}
    </div>
    {errors.map((error) => <p className="field-error" role="alert" key={error.message}>{error.message}</p>)}
    <div className="property-list">
      {tab === 'properties' ? <>
        <Section title="Basic" open>
          <Control label="Field type"><select value={field.type} onChange={(event) => changeType(event.target.value)}>{palette.map((item) => <option key={item.type} value={item.type}>{item.label}</option>)}</select></Control>
          <Control label="Label"><input value={field.label ?? ''} onChange={(event) => onPatch({ label: event.target.value })} /></Control>
          <Control label="Name"><input required aria-invalid={!field.name} value={field.name} onChange={(event) => onPatch({ name: safeName(event.target.value) })} /></Control>
          <Control label="Placeholder"><input value={field.placeholder ?? ''} onChange={(event) => onPatch({ placeholder: event.target.value || undefined })} /></Control>
          <Control label="Description"><textarea rows={3} value={field.description ?? ''} onChange={(event) => onPatch({ description: event.target.value || undefined })} /></Control>
          <DefaultValue field={field} onPatch={onPatch} />
          <Switch label="Required" checked={field.validation?.required ?? false} onChange={(event) => onPatch({ validation: { ...field.validation, required: event.target.checked } })} />
          <Switch label="Read only" checked={field.readOnly ?? false} onChange={(event) => onPatch({ readOnly: event.target.checked })} />
          <Switch label="Disabled" checked={field.disabled ?? false} onChange={(event) => onPatch({ disabled: event.target.checked })} />
        </Section>
        {hasOptions(field.type) ? <Section title="Options" open><OptionEditor field={field} onPatch={onPatch} /></Section> : null}
        {hasOptions(field.type) ? <Section title="Data source"><DataSourceEditor value={field.dataSource} onChange={(dataSource) => onPatch({ dataSource })} /></Section> : null}
        <Section title="Structure"><Control label="Parent"><select value={parent} onChange={(event) => onReparent(event.target.value)}><option value="">Form root</option>{allPaths(schema).filter((candidate) => candidate !== path && !candidate.startsWith(`${path}.`) && structural(findField(schema, candidate)!.field)).map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}</select></Control></Section>
        <Section title="Advanced"><Control label="Metadata JSON"><textarea rows={5} value={metadata} onChange={(event) => setMetadata(event.target.value)} onBlur={() => patchJson('metadata', metadata)} /></Control><Control label="Type config JSON"><textarea rows={5} value={config} onChange={(event) => setConfig(event.target.value)} onBlur={() => patchJson('config', config)} /></Control><p className="muted">{siblings.length} sibling field{siblings.length === 1 ? '' : 's'}</p></Section>
      </> : null}
      {tab === 'validation' ? <Section title="Validation rules" open>
        <Switch label="Required" checked={field.validation?.required ?? false} onChange={(event) => onPatch({ validation: { ...field.validation, required: event.target.checked } })} />
        {isTextual(field.type) ? <><NumberControl label="Minimum length" value={field.validation?.minLength} onChange={(minLength) => onPatch({ validation: { ...field.validation, minLength } })} /><NumberControl label="Maximum length" value={field.validation?.maxLength} onChange={(maxLength) => onPatch({ validation: { ...field.validation, maxLength } })} /><Control label="Pattern"><input value={field.validation?.pattern ?? ''} onChange={(event) => onPatch({ validation: { ...field.validation, pattern: event.target.value || undefined } })} /></Control></> : null}
        {isNumeric(field.type) ? <><NumberControl label="Minimum" value={field.validation?.min} onChange={(min) => onPatch({ validation: { ...field.validation, min } })} /><NumberControl label="Maximum" value={field.validation?.max} onChange={(max) => onPatch({ validation: { ...field.validation, max } })} /><NumberControl label="Multiple of" value={field.validation?.multipleOf} onChange={(multipleOf) => onPatch({ validation: { ...field.validation, multipleOf } })} /></> : null}
        {field.type === 'array' || field.type === 'multi-select' || field.type === 'checkbox-group' ? <><NumberControl label="Minimum items" value={field.validation?.minItems} onChange={(minItems) => onPatch({ validation: { ...field.validation, minItems } })} /><NumberControl label="Maximum items" value={field.validation?.maxItems} onChange={(maxItems) => onPatch({ validation: { ...field.validation, maxItems } })} /><Switch label="Unique items" checked={field.validation?.uniqueItems ?? false} onChange={(event) => onPatch({ validation: { ...field.validation, uniqueItems: event.target.checked } })} /></> : null}
        <Control label="Required error message"><input value={String(validationMessages.required ?? '')} onChange={(event) => patchMetadataGroup('validationMessages', 'required', event.target.value || undefined)} /></Control>
      </Section> : null}
      {tab === 'logic' ? <Section title="Conditions & dependencies" open>
        <ConditionEditor label="Visible when" condition={field.visibleWhen} paths={paths} onChange={(visibleWhen) => onPatch({ visibleWhen })} />
        <ConditionEditor label="Disabled when" condition={field.disabledWhen} paths={paths} onChange={(disabledWhen) => onPatch({ disabledWhen })} />
        <ConditionEditor label="Required when" condition={field.requiredWhen} paths={paths} onChange={(requiredWhen) => onPatch({ requiredWhen })} />
        <ConditionEditor label="Read only when" condition={field.readOnlyWhen} paths={paths} onChange={(readOnlyWhen) => onPatch({ readOnlyWhen })} />
        <Control label="Dependencies (comma-separated)"><input value={field.dependsOn?.join(', ') ?? ''} onChange={(event) => onPatch({ dependsOn: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /></Control>
        <Switch label="Reset on dependency change" checked={field.resetOnDependencyChange ?? false} onChange={(event) => onPatch({ resetOnDependencyChange: event.target.checked })} />
        <Control label="Hidden value policy"><select value={field.hiddenValuePolicy ?? 'preserve'} onChange={(event) => onPatch({ hiddenValuePolicy: event.target.value as FieldSchema['hiddenValuePolicy'] })}><option value="preserve">Preserve</option><option value="clear">Clear</option><option value="reset">Reset</option></select></Control>
      </Section> : null}
      {tab === 'appearance' ? <Section title="Appearance" open>
        <Control label="Label position"><select value={String(appearance.labelPosition ?? 'top')} onChange={(event) => patchMetadataGroup('appearance', 'labelPosition', event.target.value)}><option value="top">Top</option><option value="left">Left</option><option value="hidden">Hidden</option></select></Control>
        <Control label="Help text position"><select value={String(appearance.helpPosition ?? 'below')} onChange={(event) => patchMetadataGroup('appearance', 'helpPosition', event.target.value)}><option value="below">Below input</option><option value="tooltip">Tooltip</option><option value="hidden">Hidden</option></select></Control>
        <Control label="Input density"><select value={String(appearance.density ?? 'standard')} onChange={(event) => patchMetadataGroup('appearance', 'density', event.target.value)}><option value="compact">Compact</option><option value="standard">Standard</option><option value="comfortable">Comfortable</option></select></Control>
        <Control label="CSS class"><input value={String(appearance.className ?? '')} onChange={(event) => patchMetadataGroup('appearance', 'className', event.target.value || undefined)} /></Control>
      </Section> : null}
    </div>
  </aside>;
}

function Section({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) { return <details open={open}><summary>{title}</summary><div className="section-body">{children}</div></details>; }
function Control({ label, children }: { label: string; children: ReactNode }) { return <label className="control-label"><span>{label}</span>{children}</label>; }
function NumberControl({ label, value, onChange }: { label: string; value?: number; onChange: (value?: number) => void }) { return <Control label={label}><input type="number" value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))} /></Control>; }
function DefaultValue({ field, onPatch }: { field: FieldSchema; onPatch: (patch: Partial<FieldSchema>) => void }) {
  if (['checkbox','switch'].includes(field.type)) return <Switch label="Default value" checked={Boolean(field.defaultValue)} onChange={(event) => onPatch({ defaultValue: event.target.checked })} />;
  return <Control label="Default value"><input type={isNumeric(field.type) ? 'number' : 'text'} value={typeof field.defaultValue === 'string' || typeof field.defaultValue === 'number' ? String(field.defaultValue) : ''} onChange={(event) => onPatch({ defaultValue: event.target.value === '' ? undefined : isNumeric(field.type) ? Number(event.target.value) : event.target.value })} /></Control>;
}
function OptionEditor({ field, onPatch }: { field: FieldSchema; onPatch: (patch: Partial<FieldSchema>) => void }) {
  const options = [...(field.options ?? [])]; const update = (index: number, patch: Record<string, unknown>) => { options[index] = { ...options[index], ...patch }; onPatch({ options }); };
  return <div className="options">{options.map((option, index) => <div className="option-row" key={index}><input aria-label={`Option ${index + 1} label`} value={option.label} onChange={(event) => update(index, { label: event.target.value })} /><input aria-label={`Option ${index + 1} value`} value={String(option.value)} onChange={(event) => update(index, { value: event.target.value })} /><button aria-label="Move option up" disabled={!index} onClick={() => { [options[index - 1], options[index]] = [options[index], options[index - 1]]; onPatch({ options }); }}>Up</button><button aria-label="Delete option" onClick={() => onPatch({ options: options.filter((_, item) => item !== index) })}>X</button></div>)}<button onClick={() => onPatch({ options: [...options, { label: 'New option', value: `option${options.length + 1}` }] })}>Add option</button></div>;
}
const operators: readonly ConditionOperator[] = ['equals','notEquals','exists','notExists','contains','greaterThan','lessThan'];
function ConditionEditor({ label, condition, paths, onChange }: { label: string; condition?: FieldCondition; paths: string[]; onChange: (value?: FieldCondition) => void }) {
  const simple = condition && 'field' in condition ? condition : undefined;
  return <fieldset className="condition"><legend>{label}</legend><Switch label="Enabled" checked={Boolean(condition)} onChange={(event) => onChange(event.target.checked ? { field: paths[0] ?? '', operator: 'equals', value: '' } : undefined)} />{condition ? <><select aria-label={`${label} field`} value={simple?.field ?? ''} onChange={(event) => onChange({ field: event.target.value, operator: simple?.operator ?? 'equals', value: simple?.value })}><option value="">Select field</option>{paths.map((item) => <option key={item}>{item}</option>)}</select><select aria-label={`${label} operator`} value={simple?.operator ?? 'equals'} onChange={(event) => onChange({ field: simple?.field ?? '', operator: event.target.value as ConditionOperator, value: simple?.value })}>{operators.map((operator) => <option key={operator}>{operator}</option>)}</select><input aria-label={`${label} value`} value={String(simple?.value ?? '')} onChange={(event) => onChange({ field: simple?.field ?? '', operator: simple?.operator ?? 'equals', value: event.target.value })} /></> : null}</fieldset>;
}
function DataSourceEditor({ value, onChange }: { value?: DataSourceConfig; onChange: (value?: DataSourceConfig) => void }) {
  const type = value?.type ?? 'none';
  return <div className="data-source"><Control label="Source type"><select value={type} onChange={(event) => { const next = event.target.value; onChange(next === 'none' ? undefined : next === 'static' ? { type: 'static', options: [] } : { type: 'url', url: '', method: 'GET' }); }}><option value="none">Schema options</option><option value="static">Static</option><option value="url">URL</option>{type === 'function' ? <option value="function">Function (read-only)</option> : null}</select></Control>{type === 'static' ? <Control label="Static options JSON"><textarea rows={4} value={JSON.stringify(value?.options ?? [], null, 2)} onChange={(event) => { try { onChange({ ...value, type: 'static', options: JSON.parse(event.target.value) }); } catch { /* retain working value */ } }} /></Control> : null}{type === 'url' ? <><Control label="URL"><input value={value?.url ?? ''} onChange={(event) => onChange({ ...value, type: 'url', url: event.target.value })} /></Control><Control label="Method"><select value={value?.method ?? 'GET'} onChange={(event) => onChange({ ...value, type: 'url', method: event.target.value as 'GET' | 'POST' })}><option>GET</option><option>POST</option></select></Control><Control label="Search parameter"><input value={value?.searchParam ?? ''} onChange={(event) => onChange({ ...value, type: 'url', searchParam: event.target.value || undefined })} /></Control><Switch label="Cache results" checked={value?.cache ?? false} onChange={(event) => onChange({ ...value, type: 'url', cache: event.target.checked })} /></> : null}</div>;
}
function safeName(value: string) { return value.replace(/[^a-zA-Z0-9]+(.)?/g, (_, char: string | undefined) => char?.toUpperCase() ?? '').replace(/^[A-Z]/, (char) => char.toLowerCase()); }





