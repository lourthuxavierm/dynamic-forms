import { useEffect, useState, type ChangeEvent, type RefObject } from 'react';
import type { FormSchema } from '@dynamic-form-engine/core';
import {
  ChevronDown, ChevronRight, CircleAlert, CircleCheck, CircleHelp, ClipboardCopy, Database, Eye, FileDown, FilePlus2, FileUp,
  History, House, LoaderCircle, Palette, PencilRuler, Redo2, Rocket, Save, Settings, Undo2, Workflow,
} from 'lucide-react';
import { Button, IconButton, Menu } from '../ui/Primitives';

interface TopBarProps {
  schema: FormSchema; issueCount: number; saved: boolean; savedAt?: number; canUndo: boolean; canRedo: boolean;
  uploadRef: RefObject<HTMLInputElement | null>;
  onSchemaChange: (schema: FormSchema) => void; onUndo: () => void; onRedo: () => void; onNew: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void; onExport: () => void; onCopy: () => void;
  onSave: () => void; onPublish: () => void; onManage: () => void; onPreview: () => void; onSettings: () => void;
}

export function TopBar(p: TopBarProps) {
  return <header className="topbar">
    <div className="brand"><span className="brand-mark" aria-hidden="true">DF</span><div><strong>Dynamic Forms</strong><small>Form Builder Studio</small></div></div>
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <House size={18} aria-hidden="true" />
      <span>Forms</span><ChevronRight size={16} aria-hidden="true" />
      <span>Customers</span><ChevronRight size={16} aria-hidden="true" />
      <input className="breadcrumb-current" aria-label="Form ID" value={p.schema.id} size={Math.max(8, p.schema.id.length)} onChange={(event) => p.onSchemaChange({ ...p.schema, id: event.target.value })} />
    </nav>
    <SaveStatus issueCount={p.issueCount} saved={p.saved} savedAt={p.savedAt} onSave={p.onSave} />
    <div className="header-actions">
      <IconButton aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!p.canUndo} onClick={p.onUndo}><Undo2 size={20} /></IconButton>
      <IconButton aria-label="Redo" title="Redo (Ctrl+Y)" disabled={!p.canRedo} onClick={p.onRedo}><Redo2 size={20} /></IconButton>
      <Button className="preview-action" aria-label="Preview" onClick={p.onPreview}><Eye size={17} aria-hidden="true" /><span className="button-label">Preview</span></Button>
      <input ref={p.uploadRef} hidden type="file" accept=".json,application/json" onChange={p.onImport} />
      <Menu label="Export options" variant="secondary" triggerClassName="export-action" trigger={<><FileDown size={17} aria-hidden="true" /><span className="button-label">Export</span><ChevronDown size={16} aria-hidden="true" /></>} items={[
        { label: 'Download JSON', icon: <FileDown size={16} />, onSelect: p.onExport },
        { label: 'Copy JSON', icon: <ClipboardCopy size={16} />, onSelect: p.onCopy },
        { label: 'Import JSON', icon: <FileUp size={16} />, onSelect: () => p.uploadRef.current?.click() },
        { label: 'New form', icon: <FilePlus2 size={16} />, onSelect: p.onNew },
      ]} />
      <div className="publish-split">
        <Button variant="primary" className="publish-action" aria-label="Publish" disabled={p.issueCount > 0} title={p.issueCount ? 'Resolve blocking issues before publishing' : undefined} onClick={p.onPublish}><Rocket size={17} aria-hidden="true" /><span className="button-label">Publish</span></Button>
        <Menu label="More publish options" variant="primary" triggerClassName="publish-more" trigger={<ChevronDown size={18} />} items={[
          { label: 'Save draft', icon: <Save size={16} />, onSelect: p.onSave },
          { label: 'Versions & releases', icon: <History size={16} />, onSelect: p.onManage },
        ]} />
      </div>
      <span className="header-divider" aria-hidden="true" />
      <IconButton aria-label="Settings" onClick={p.onSettings}><Settings size={20} /></IconButton>
      <IconButton aria-label="Help" onClick={() => window.open('https://github.com/lourthuxavierm/dynamic-forms#readme', '_blank', 'noopener')}><CircleHelp size={20} /></IconButton>
      <button type="button" className="profile-action" aria-label="User profile">XM</button>
    </div>
  </header>;
}

function SaveStatus({ issueCount, saved, savedAt, onSave }: { issueCount: number; saved: boolean; savedAt?: number; onSave: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(timer); }, []);
  if (issueCount) return <div className="save-status"><span className="status-pill status-pill--danger schema-status"><CircleAlert size={16} aria-hidden="true" />{issueCount} issue{issueCount === 1 ? '' : 's'}</span></div>;
  return <div className="save-status">
    <button type="button" className={`status-pill ${saved ? 'status-pill--success' : 'status-pill--pending'}`} onClick={onSave} title="Save draft now">
      {saved ? <CircleCheck size={16} aria-hidden="true" /> : <LoaderCircle size={16} className="spin" aria-hidden="true" />}{saved ? 'Saved' : 'Saving...'}
    </button>
    {saved && savedAt ? <small>Last saved {relativeTime(now - savedAt)}</small> : null}
  </div>;
}

function relativeTime(elapsed: number) {
  const minutes = Math.floor(Math.max(0, elapsed) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

export type RailSection = 'Design' | 'Data' | 'Logic' | 'Themes' | 'Settings';
const navigation: ReadonlyArray<readonly [RailSection, typeof PencilRuler]> = [['Design', PencilRuler], ['Data', Database], ['Logic', Workflow], ['Themes', Palette], ['Settings', Settings]];

export function NavigationRail({ active, onNavigate }: { active: RailSection; onNavigate: (section: RailSection) => void }) {
  return <nav className="navigation-rail" aria-label="Primary navigation">
    {navigation.map(([label, Icon]) => <button type="button" key={label} className={label === active ? 'active' : ''} aria-current={label === active ? 'page' : undefined} onClick={() => onNavigate(label)}>
      <Icon size={22} aria-hidden="true" /><span>{label}</span>
    </button>)}
  </nav>;
}
