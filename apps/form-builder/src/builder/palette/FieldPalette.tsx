import { useMemo, useState } from 'react';
import type { FieldType } from '@dynamic-form-engine/core';
import { ChevronDown, LayoutGrid, List, Search } from 'lucide-react';
import { groupIcons, palette, paletteGroups, type PaletteGroupName } from '../../schema/catalogue';
import { Button, PanelHeader } from '../../ui/Primitives';

const EXPANDED_KEY = 'dynamic-forms:palette:expanded';
const VIEW_KEY = 'dynamic-forms:palette:view';

function defaultExpanded(): Record<PaletteGroupName, boolean> {
  return Object.fromEntries(paletteGroups.map((group) => [group, group === 'Basic Inputs'])) as Record<PaletteGroupName, boolean>;
}

function loadExpanded() {
  try {
    return { ...defaultExpanded(), ...JSON.parse(localStorage.getItem(EXPANDED_KEY) ?? '{}') } as Record<PaletteGroupName, boolean>;
  } catch {
    return defaultExpanded();
  }
}

function loadView(): 'grid' | 'list' {
  try { return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'; } catch { return 'grid'; }
}

function persist(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

export function FieldPalette({ onAdd }: { onAdd: (type: FieldType) => void }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>(loadView);
  const [expanded, setExpanded] = useState(loadExpanded);
  const normalized = query.trim().toLowerCase();
  const matches = useMemo(() => palette.filter((item) =>
    !normalized || [item.label, item.type, item.group, ...(item.keywords ?? [])].some((value) => value.toLowerCase().includes(normalized))
  ), [normalized]);
  const visibleGroups = normalized ? paletteGroups.filter((group) => matches.some((item) => item.group === group)) : paletteGroups;

  const toggleView = () => {
    const next = view === 'grid' ? 'list' : 'grid';
    setView(next);
    persist(VIEW_KEY, next);
  };
  const toggleGroup = (group: PaletteGroupName) => {
    const next = { ...expanded, [group]: !expanded[group] };
    setExpanded(next);
    persist(EXPANDED_KEY, JSON.stringify(next));
  };

  return <aside className="palette-panel" aria-label="Field library">
    <PanelHeader title="Add Fields" description="Drag and drop fields to build your form" />
    <div className="palette-tools">
      <label className="palette-search">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search fields</span>
        <input type="search" placeholder="Search fields..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <Button className="palette-view-toggle" aria-label={view === 'grid' ? 'List view' : 'Grid view'} title={view === 'grid' ? 'Show as list' : 'Show as grid'} onClick={toggleView}>
        {view === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
      </Button>
    </div>
    {visibleGroups.length ? <div className="palette-groups">
      {visibleGroups.map((group) => {
        const items = matches.filter((item) => item.group === group);
        const open = normalized ? true : expanded[group];
        const GroupIcon = groupIcons[group];
        return <section key={group} className="palette-group" data-open={open}>
          <h3>
            <button type="button" aria-expanded={open} onClick={() => { if (!normalized) toggleGroup(group); }}>
              <GroupIcon size={20} aria-hidden="true" /><span>{group}</span><ChevronDown size={18} className="chevron" aria-hidden="true" />
            </button>
          </h3>
          {open ? items.length ? <div className={`palette-grid palette-grid--${view}`}>
            {items.map((item) => {
              const Icon = item.icon;
              return <button type="button" key={item.type} className="palette-item" aria-label={item.label} draggable onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'copy';
                event.dataTransfer.setData('application/x-builder-field', item.type);
              }} onClick={() => onAdd(item.type)}>
                <span className="field-type-icon" data-accent={item.accent} aria-hidden="true"><Icon size={18} strokeWidth={2.2} /></span>
                <span className="palette-label">{item.label}</span>
              </button>;
            })}
          </div> : <p className="palette-coming-soon">Layout components are coming soon.</p> : null}
        </section>;
      })}
    </div> : <div className="palette-empty" role="status"><strong>No fields found</strong><span>Try a field name or type.</span><Button size="small" onClick={() => setQuery('')}>Clear search</Button></div>}
  </aside>;
}
