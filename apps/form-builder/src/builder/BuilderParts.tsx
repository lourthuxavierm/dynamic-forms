import type { DragEvent } from 'react';
import type { FieldSchema, FieldType } from '@dynamic-form-engine/core';
import { hasOptions, isNumeric, isTextual, palette } from '../schema/catalogue';
import { structural } from '../schema/operations';
interface NodeProps {
  field: FieldSchema; path: string; selectedPath?: string;
  onSelect: (path: string) => void; onAdd: (type: FieldType, parentPath?: string) => void; onDrop: (event: DragEvent, parentPath: string) => void;
  onMove: (path: string, direction: -1 | 1) => void; onReparent: (path: string, parent: string) => void;
  onDuplicate: (path: string) => void; onRemove: (path: string) => void;
}
export function FieldNode(props: NodeProps) {
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
export function DropZone({ label, onAdd, onDrop }: { label: string; onAdd: () => void; onDrop: (event: DragEvent) => void }) {
  return <button className="drop-zone" onClick={onAdd} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>{label}</button>;
}

