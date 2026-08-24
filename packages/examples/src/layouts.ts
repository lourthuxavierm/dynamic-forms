export type LayoutId = 'grid' | 'sections' | 'cards' | 'sidebar' | 'summary' | 'custom';
export interface LayoutMetadata { id: LayoutId; label: string; description: string; }
export const baseLayoutMetadata: readonly LayoutMetadata[] = [
  { id: 'grid', label: 'Responsive grid', description: 'Twelve-column form grid with breakpoint-aware spans.' },
  { id: 'sections', label: 'Sections and fieldsets', description: 'Semantic grouped sections for related information.' },
  { id: 'cards', label: 'Cards, tabs and accordions', description: 'Progressive disclosure for dense enterprise forms.' },
  { id: 'sidebar', label: 'Sidebar and detail', description: 'Master navigation beside a focused detail editor.' },
  { id: 'summary', label: 'Read-only summary', description: 'Review layout optimized for scanning and approval.' },
];
export const customLayoutMetadata: LayoutMetadata = { id: 'custom', label: 'Registered compact layout', description: 'Runtime-registered two-column compact layout.' };
