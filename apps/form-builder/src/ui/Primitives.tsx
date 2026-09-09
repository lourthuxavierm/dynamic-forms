import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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

export function Tabs<T extends string>({ items, value, onChange, ariaLabel }: { items: readonly T[]; value: T; onChange: (value: T) => void; ariaLabel: string }) {
  return <nav className="ui-tabs" aria-label={ariaLabel}>
    {items.map((item) => <Button key={item} variant="ghost" className={value === item ? 'active' : ''} aria-current={value === item ? 'page' : undefined} onClick={() => onChange(item)}>{item}</Button>)}
  </nav>;
}

export function Switch({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={classes('ui-switch', className)}><span>{label}</span><input type="checkbox" {...props} /></label>;
}

export function PanelHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="ui-panel-header"><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>{actions ? <div>{actions}</div> : null}</header>;
}

