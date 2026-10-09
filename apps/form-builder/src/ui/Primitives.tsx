import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { Asterisk } from 'lucide-react';
import { paletteItem } from '../schema/catalogue';

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline-danger' | 'outline-primary';
  size?: 'small' | 'medium';
}

export function Button({ className, variant = 'secondary', size = 'medium', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={classes('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)} {...props} />;
}

export function IconButton({ className, children, ...props }: ButtonProps) {
  return <Button className={classes('ui-icon-button', className)} variant="ghost" {...props}>{children}</Button>;
}

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'success' | 'danger' | 'info' }) {
  return <span className={classes('ui-badge', `ui-badge--${tone}`, className)} {...props} />;
}

export function Tabs<T extends string>({ items, value, onChange, ariaLabel, labels }: { items: readonly T[]; value: T; onChange: (value: T) => void; ariaLabel: string; labels?: Partial<Record<T, string>> }) {
  return <nav className="ui-tabs" aria-label={ariaLabel}>
    {items.map((item) => <Button key={item} variant="ghost" className={value === item ? 'active' : ''} aria-current={value === item ? 'page' : undefined} onClick={() => onChange(item)}>{labels?.[item] ?? item}</Button>)}
  </nav>;
}

export function Switch({ label, description, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return <label className={classes('ui-switch', className)}>
    <span className="ui-switch-copy"><span>{label}</span>{description ? <small>{description}</small> : null}</span>
    <input type="checkbox" role="switch" {...props} />
  </label>;
}

export function PanelHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="ui-panel-header"><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>{actions ? <div className="ui-panel-actions">{actions}</div> : null}</header>;
}

export interface MenuItem { label: string; icon?: ReactNode; onSelect: () => void; disabled?: boolean; tone?: 'danger' }

/** Button that opens a list of actions; closes on selection, Escape, or an outside click. */
export function Menu({ label, trigger, items, align = 'end', className, triggerClassName, variant = 'ghost' }: {
  label: string; trigger: ReactNode; items: readonly MenuItem[]; align?: 'start' | 'end'; className?: string; triggerClassName?: string; variant?: ButtonProps['variant'];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); root.current?.querySelector<HTMLButtonElement>('button')?.focus(); } };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={root} className={classes('ui-menu', className)} onClick={(event) => event.stopPropagation()}>
    <Button variant={variant} className={triggerClassName} aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen((value) => !value)}>{trigger}</Button>
    {open ? <div id={id} role="menu" aria-label={label} className={`ui-menu-list ui-menu-list--${align}`}>
      {items.map((item) => <button key={item.label} type="button" role="menuitem" disabled={item.disabled} className={item.tone === 'danger' ? 'danger' : undefined} onClick={() => { setOpen(false); item.onSelect(); }}>
        {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}{item.label}
      </button>)}
    </div> : null}
  </div>;
}

export function FieldTypeIcon({ type, size = 18, className }: { type: string; size?: number; className?: string }) {
  const item = paletteItem(type);
  const Icon = item?.icon ?? Asterisk;
  return <span className={classes('field-type-icon', className)} data-accent={item?.accent ?? 'slate'} aria-hidden="true"><Icon size={size} strokeWidth={2} /></span>;
}
