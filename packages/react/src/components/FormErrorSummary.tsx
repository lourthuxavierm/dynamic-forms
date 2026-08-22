import { useEffect, useId, useRef } from 'react';
import { useFormState } from '../hooks/useFormState';

export interface FormErrorSummaryProps {
  title?: string;
  focusOnChange?: boolean;
  className?: string;
}

/** Announces form validation errors and links users to the invalid control. */
export function FormErrorSummary({ title = 'Please correct the following errors', focusOnChange = true, className }: FormErrorSummaryProps) {
  const errors = useFormState((state) => state.errors);
  const entries = Object.entries(errors);
  const summary = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const titleId = `dynamic-forms-error-summary-${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`;

  useEffect(() => {
    if (focusOnChange && entries.length) summary.current?.focus();
  }, [entries.length, focusOnChange]);

  if (!entries.length) return null;
  return (
    <div ref={summary} className={className} role="alert" aria-live="assertive" aria-atomic="true" tabIndex={-1} aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <ul>
        {entries.map(([name, message]) => (
          <li key={name}><a href={`#${fieldId(name)}`} onClick={(event) => { event.preventDefault(); focusField(name); }}>{message}</a></li>
        ))}
      </ul>
    </div>
  );
}

export function fieldId(name: string): string {
  return `dynamic-field-${name.replace(/[^A-Za-z0-9_-]/g, '-')}`;
}

function focusField(name: string): void {
  if (typeof document === 'undefined') return;
  const id = fieldId(name);
  const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(name) : name.replace(/(["\\])/g, '\\$1');
  document.getElementById(id)?.focus() ?? document.querySelector<HTMLElement>(`[name="${escaped}"]`)?.focus();
}
