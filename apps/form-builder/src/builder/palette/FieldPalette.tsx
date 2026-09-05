import { useMemo, useState } from 'react';
import type { FieldType } from '@dynamic-form-engine/core';
import { palette, paletteGroups, type PaletteGroupName } from '../../schema/catalogue';
import { Button, IconButton, PanelHeader } from '../../ui/Primitives';

const EXPANDED_KEY = 'dynamic-forms:palette:expanded';
const VIEW_KEY = 'dynamic-forms:palette:view';

function defaultExpanded(): Record<PaletteGroupName, boolean> {
  return Object.fromEntries(paletteGroups.map((group) => [group, group !== 'Layout & Utilities'])) as Record<PaletteGroupName, boolean>;
}

function loadExpanded() {
  try {
    return { ...defaultExpanded(), ...JSON.parse(localStorage.getItem(EXPANDED_KEY) ?? '{}') } as Record<PaletteGroupName, boolean>;
  } catch {
    return defaultExpanded();
  }
}

function loadView(): 'grid' | 'list' {
  return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
}

export function FieldPalette({ onAdd }: { onAdd: (type: FieldType) => void }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>(loadView);
  const [expanded, setExpanded] = useState(loadExpanded);
  const normalized = query.trim().toLowerCase();
  const matches = useMemo(() => palette.filter((item) =>
    !normalized || [item.label, item.type, item.group, ...(item.keywords ?? [])].some((value) => value.toLowerCase().includes(normalized))
  ), [normalized]);
  const populatedGroups = paletteGroups.filter((group) => matches.some((item) => item.group === group));
  const visibleGroups = normalized ? populatedGroups : paletteGroups;
  const allExpanded = paletteGroups.every((group) => expanded[group]);

  const changeView = (next: 'grid' | 'list') => {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  };
  const toggleGroup = (group: PaletteGroupName) => {
    const next = { ...expanded, [group]: !expanded[group] };
    setExpanded(next);
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(next));
  };
  const toggleAll = () => {
    const next = Object.fromEntries(paletteGroups.map((group) => [group, !allExpanded])) as Record<PaletteGroupName, boolean>;
    setExpanded(next);
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(next));
  };

  return <aside className="palette-panel" aria-label="Field library">
    <PanelHeader title="Add Fields" actions={<IconButton size="small" aria-label={allExpanded ? 'Collapse all field groups' : 'Expand all field groups'} onClick={toggleAll}>•••</IconButton>} />
    <div className="palette-tools">
      <label className="palette-search">
        <span aria-hidden="true">⌕</span>
        <span className="sr-only">Search fields</span>
        <input type="search" placeholder="Search fields…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="palette-view" aria-label="Field layout">
        <Button size="small" variant="ghost" className={view === 'grid' ? 'active' : ''} aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => changeView('grid')}>▦</Button>
        <Button size="small" variant="ghost" className={view === 'list' ? 'active' : ''} aria-label="List view" aria-pressed={view === 'list'} onClick={() => changeView('list')}>☷</Button>
      </div>
    </div>
    {visibleGroups.length ? <div className="palette-groups">
      {visibleGroups.map((group) => {
        const items = matches.filter((item) => item.group === group);
        const open = normalized ? true : expanded[group];
        return <details key={group} className="palette-group" open={open} onToggle={(event) => {
          if (!normalized && event.currentTarget.open !== expanded[group]) toggleGroup(group);
        }}>
          <summary><span>{group}</span><small>{items.length || ''}</small></summary>
          {items.length ? <div className={`palette-grid palette-grid--${view}`}>
            {items.map((item) => <Button key={item.type} className="palette-item" data-accent={item.accent} aria-label={item.label} draggable onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'copy';
              event.dataTransfer.setData('application/x-builder-field', item.type);
            }} onClick={() => onAdd(item.type)}>
              <span className="palette-icon" aria-hidden="true">{item.icon}</span>
              <span className="palette-label">{item.label}</span>
            </Button>)}
          </div> : <p className="palette-coming-soon">Layout controls arrive in Phase 4.</p>}
        </details>;
      })}
    </div> : <div className="palette-empty" role="status"><strong>No fields found</strong><span>Try a field name or type.</span><Button size="small" onClick={() => setQuery('')}>Clear search</Button></div>}
  </aside>;
}

