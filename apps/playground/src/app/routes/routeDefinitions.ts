import type { PlaygroundRouteDefinition } from '../../types/playground';

export const routeDefinitions = [
  { id: 'dashboard', path: '/', title: 'Dashboard', group: 'Start', status: 'available', priority: 'P0', description: 'Package and capability overview.' },
  { id: 'basic-form', path: '/basic-form', title: 'Basic form', group: 'Start', status: 'available', priority: 'P0', description: 'Minimal validated form workflow.' },
  { id: 'fields', path: '/fields', title: 'Fields catalogue', group: 'Core concepts', status: 'available', priority: 'P0', description: 'Default MUI registry controls.' },
  { id: 'validation', path: '/validation', title: 'Validation', group: 'Core concepts', status: 'available', priority: 'P0', description: 'Validation modes and errors.' },
  { id: 'conditions', path: '/conditions', title: 'Conditions', group: 'Core concepts', status: 'available', priority: 'P0', description: 'Visibility and business rules.' },
  { id: 'dependencies', path: '/dependencies', title: 'Dependencies', group: 'Core concepts', status: 'available', priority: 'P0', description: 'Dependent field behavior.' },
  { id: 'data-sources', path: '/data-sources', title: 'Data sources', group: 'Core concepts', status: 'available', priority: 'P0', description: 'Async loading and cancellation.' },
  { id: 'arrays', path: '/arrays', title: 'Arrays', group: 'Enterprise', status: 'available', priority: 'P1', description: 'Repeatable field collections.' },
  { id: 'nested-fields', path: '/nested-fields', title: 'Nested fields', group: 'Enterprise', status: 'available', priority: 'P1', description: 'Nested value paths.' },
  { id: 'wizard', path: '/wizard', title: 'Wizard', group: 'Enterprise', status: 'available', priority: 'P1', description: 'Multi-step workflows.' },
  { id: 'permissions', path: '/permissions', title: 'Permissions', group: 'Enterprise', status: 'available', priority: 'P1', description: 'Role-aware presentation.' },
  { id: 'layouts', path: '/layouts', title: 'Layouts', group: 'Enterprise', status: 'available', priority: 'P1', description: 'Responsive form layouts.' },
  { id: 'showcase', path: '/showcase', title: 'Enterprise showcase', group: 'Enterprise', status: 'available', priority: 'P0', description: 'Complete cross-feature workflows.' },
  { id: 'accessibility', path: '/accessibility', title: 'Accessibility', group: 'Quality', status: 'planned', priority: 'P0', description: 'Keyboard and assistive technology checks.' },
  { id: 'performance', path: '/performance', title: 'Performance', group: 'Quality', status: 'planned', priority: 'P0', description: 'Repeatable form benchmarks.' },
  { id: 'devtools', path: '/devtools', title: 'DevTools', group: 'Quality', status: 'planned', priority: 'P1', description: 'Redacted runtime diagnostics.' },
] as const satisfies readonly PlaygroundRouteDefinition[];
