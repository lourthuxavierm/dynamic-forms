import type { ReactNode } from 'react';

export interface LiveRegionProps {
  children?: ReactNode;
  mode?: 'polite' | 'assertive';
  atomic?: boolean;
  className?: string;
}

/** A renderer-neutral status announcement for validation and async loading. */
export function LiveRegion({ children, mode = 'polite', atomic = true, className }: LiveRegionProps) {
  return <span className={className} role="status" aria-live={mode} aria-atomic={atomic}>{children}</span>;
}