import type { ChangeEvent, RefObject } from 'react';
import type { FormSchema } from '@dynamic-form-engine/core';
import { Badge, Button } from '../ui/Primitives';

interface TopBarProps {
  schema: FormSchema;
  issueCount: number;
  saved: boolean;
  canUndo: boolean;
  canRedo: boolean;
  uploadRef: RefObject<HTMLInputElement | null>;
  onSchemaChange: (schema: FormSchema) => void;
  onUndo: () => void;
  onRedo: () => void;
  onNew: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onCopy: () => void;
  onSave: () => void;
  onPublish: () => void;
  onManage: () => void;
}

export function TopBar(props: TopBarProps) {
  const status = props.issueCount
    ? `${props.issueCount} issue${props.issueCount === 1 ? '' : 's'}`
    : props.saved ? 'Saved' : 'Saving…';

  return <header className="topbar">
    <div className="brand">
      <span aria-hidden="true">DF</span>
      <div><strong>Dynamic Forms</strong><small>Schema Builder</small></div>
    </div>
    <div className="form-context" aria-label="Form context">
      <span className="breadcrumb">Forms <b>/</b> Customer</span>
      <label className="document-field"><span className="sr-only">Form ID</span><input aria-label="Form ID" value={props.schema.id} onChange={(event) => props.onSchemaChange({ ...props.schema, id: event.target.value })} /></label>
      <label className="version-field"><span className="sr-only">Version</span><input aria-label="Version" value={props.schema.version ?? ''} onChange={(event) => props.onSchemaChange({ ...props.schema, version: event.target.value || undefined })} /></label>
      <Badge tone={props.issueCount ? 'danger' : 'success'} className={props.issueCount ? 'schema-status invalid' : 'schema-status valid'}>{status}</Badge>
    </div>
    <div className="header-actions">
      <Button className="toolbar-action quiet" onClick={props.onUndo} disabled={!props.canUndo} aria-label="Undo"><span aria-hidden="true">↶</span><span>Undo</span></Button>
      <Button className="toolbar-action quiet" onClick={props.onRedo} disabled={!props.canRedo} aria-label="Redo"><span aria-hidden="true">↷</span><span>Redo</span></Button>
      <span className="toolbar-divider" aria-hidden="true" />
      <Button className="toolbar-action" onClick={props.onNew} aria-label="New"><span aria-hidden="true">＋</span><span>New</span></Button>
      <Button className="toolbar-action" onClick={() => props.uploadRef.current?.click()} aria-label="Import"><span aria-hidden="true">⇧</span><span>Import</span></Button>
      <input ref={props.uploadRef} hidden type="file" accept=".json,application/json" onChange={(event) => props.onImport(event)} />
      <Button className="toolbar-action" onClick={props.onExport} aria-label="Export"><span aria-hidden="true">⇩</span><span>Export</span></Button>
      <Button className="toolbar-action" onClick={props.onCopy} aria-label="Copy JSON"><span aria-hidden="true">⧉</span><span>Copy</span></Button>
      <Button className="toolbar-action" onClick={props.onSave}>Save</Button><Button className="publish-action" disabled={props.issueCount > 0} onClick={props.onPublish}>Publish</Button><Button className="icon-action" aria-label="Manage form repository" onClick={props.onManage}>☰</Button>
      <Button className="icon-action" aria-label="Settings" title="Settings"><span aria-hidden="true">⚙</span></Button>
      <Button className="icon-action" aria-label="Help" title="Help"><span aria-hidden="true">?</span></Button>
      <Button className="profile-action" aria-label="User profile" title="User profile">XM</Button>
    </div>
  </header>;
}

const navigation = [
  ['Builder', '▦'],
  ['Playground', '▱'],
  ['Templates', '◇'],
  ['Data Sources', '▤'],
  ['Validators', '☑'],
  ['Conditions', '▽'],
  ['Settings', '⚙'],
] as const;

export function NavigationRail({ onNavigate }: { onNavigate: (label: string) => void }) {
  return <nav className="navigation-rail" aria-label="Primary navigation">
    <div className="navigation-items">
      {navigation.map(([label, icon]) => <Button key={label} className={label === 'Builder' ? 'active' : ''} aria-current={label === 'Builder' ? 'page' : undefined} onClick={() => onNavigate(label)}>
        <span className="navigation-icon" aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </Button>)}
    </div>
    <aside className="plan-card" aria-label="Plan usage">
      <strong><span aria-hidden="true">♛</span> Pro Plan</strong>
      <small>Team</small>
      <div className="plan-meter" aria-label="3 of 10 forms used"><span /></div>
      <span>3 / 10 forms</span>
      <Button onClick={() => onNavigate('Upgrade plan')}>Upgrade plan <span aria-hidden="true">→</span></Button>
    </aside>
  </nav>;
}




