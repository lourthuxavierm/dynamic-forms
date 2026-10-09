import type { DragEvent, ReactNode } from 'react';
import type { FieldSchema, FieldType } from '@dynamic-form-engine/core';
import { ArrowDown, ArrowUp, CalendarDays, ChevronDown, Copy, CornerUpLeft, EllipsisVertical, GripVertical, Mail, Phone, Plus, Trash2, Upload } from 'lucide-react';
import { paletteItem } from '../schema/catalogue';
import { structural } from '../schema/operations';
import { IconButton, Menu } from '../ui/Primitives';

interface NodeProps {
  field: FieldSchema; path: string; selectedPath?: string; footer?: ReactNode;
  onSelect: (path: string) => void; onAdd: (type: FieldType, parentPath?: string) => void; onDrop: (event: DragEvent, parentPath: string) => void;
  onMove: (path: string, direction: -1 | 1) => void; onReparent: (path: string, parent: string) => void;
  onDuplicate: (path: string) => void; onRemove: (path: string) => void;
}

export function FieldNode(props: NodeProps) {
  const { field, path } = props;
  const parentPath = path.split('.').slice(0, -1).join('.');
  const label = field.label || field.name;
  const selected = props.selectedPath === path;
  const stop = (action: () => void) => (event: { stopPropagation: () => void }) => { event.stopPropagation(); action(); };
  return <div className="node-wrap" role="treeitem" aria-selected={selected}>
    <article className={selected ? 'field-node selected' : 'field-node'} data-field-path={path} tabIndex={0} aria-label={`${label} field`}
      onClick={() => props.onSelect(path)}
      onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); props.onSelect(path); } }}
      draggable onDragStart={(event) => { event.stopPropagation(); event.dataTransfer.setData('application/x-builder-path', path); }}>
      <header className="field-node-header">
        <span className="drag-handle" aria-hidden="true"><GripVertical size={18} /></span>
        <div className="field-summary">
          <strong>{label}{field.validation?.required ? <span className="required-mark" aria-label="required"> *</span> : null}</strong>
          <small>{field.description || paletteItem(field.type)?.label || field.type}</small>
          <div className="badges">{field.visibleWhen || field.disabledWhen || field.requiredWhen ? <span>conditional</span> : null}{field.dependsOn?.length ? <span>dependent</span> : null}{field.dataSource ? <span>data</span> : null}</div>
        </div>
        <div className="node-actions">
          <IconButton size="small" aria-label={`Duplicate ${label}`} title="Duplicate" onClick={stop(() => props.onDuplicate(path))}><Copy size={17} /></IconButton>
          <IconButton size="small" className="danger" aria-label={`Delete ${label}`} title="Delete" onClick={stop(() => props.onRemove(path))}><Trash2 size={17} /></IconButton>
          <Menu label={`More actions for ${label}`} triggerClassName="ui-icon-button ui-button--small" trigger={<EllipsisVertical size={17} />} items={[
            { label: 'Move up', icon: <ArrowUp size={16} />, onSelect: () => props.onMove(path, -1) },
            { label: 'Move down', icon: <ArrowDown size={16} />, onSelect: () => props.onMove(path, 1) },
            ...(parentPath ? [{ label: 'Move to form root', icon: <CornerUpLeft size={16} />, onSelect: () => props.onReparent(path, '') }] : []),
          ]} />
        </div>
      </header>
      {structural(field) ? null : <FieldPreview field={field} />}
      {props.footer}
    </article>
    {structural(field) ? <div className="children" role="group">{field.fields?.map((child) => <FieldNode {...props} footer={undefined} key={child.name} field={child} path={`${path}.${child.name}`} />)}<DropZone label={`Add child to ${label}`} onAdd={() => props.onAdd('text', path)} onDrop={(event) => props.onDrop(event, path)} /></div> : null}
  </div>;
}

export function DropZone({ label, onAdd, onDrop }: { label: string; onAdd: () => void; onDrop: (event: DragEvent) => void }) {
  return <button type="button" className="drop-zone" onClick={onAdd} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}><Plus size={16} aria-hidden="true" />{label}</button>;
}

function FieldPreview({ field }: { field: FieldSchema }) {
  const placeholder = field.placeholder ?? `Enter ${(field.label ?? field.name).toLowerCase()}`;
  const options = field.options?.length ? field.options : [{ label: 'Option one', value: 'one' }, { label: 'Option two', value: 'two' }];
  if (field.type === 'textarea') return <div className="field-preview field-preview--textarea" aria-hidden="true">{placeholder}</div>;
  if (['select','multi-select','autocomplete','async-autocomplete','tree-select','tree-checkbox'].includes(field.type)) return <div className="field-preview" aria-hidden="true"><span>{field.placeholder ?? 'Select an option'}</span><ChevronDown size={16} /></div>;
  if (['checkbox','switch','toggle-button'].includes(field.type)) return <div className="field-preview-choice" aria-hidden="true"><span className={field.type === 'checkbox' ? 'preview-check' : 'preview-switch'} />{field.label ?? 'Enabled'}</div>;
  if (['radio','radio-group','checkbox-group','toggle-button-group'].includes(field.type)) return <div className="field-preview-choice" aria-hidden="true">{options.slice(0, 3).map((option) => <span key={String(option.value)}><span className={field.type === 'checkbox-group' ? 'preview-check' : 'preview-radio'} />{option.label}</span>)}</div>;
  if (['file','multi-file','camera','signature','document-preview'].includes(field.type)) return <div className="field-preview field-preview--upload" aria-hidden="true"><Upload size={16} /><span>Click or drop a file</span></div>;
  const icon = field.type === 'email' ? <Mail size={16} /> : field.type === 'phone' ? <Phone size={16} /> : field.type.includes('date') || field.type === 'month' ? <CalendarDays size={16} /> : null;
  return <div className="field-preview" aria-hidden="true">{icon}<span>{placeholder}</span></div>;
}
