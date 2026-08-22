export const packageStatuses = [
  { name: '@dynamic-forms/core', status: 'Implemented', responsibility: 'Schema, state, validation, rules, and data sources' },
  { name: '@dynamic-forms/react', status: 'Implemented', responsibility: 'Provider, subscriptions, hooks, and renderers' },
  { name: '@dynamic-forms/mui', status: 'Implemented', responsibility: 'MUI controls, registry, layout, and value adapters' },
  { name: 'Adapter packages', status: 'Placeholder', responsibility: 'Zod, React Hook Form, JSON Schema, and DevTools' },
] as const;
export const capabilityMatrix = [
  { capability: 'Schema validation', core: true, react: true, mui: true },
  { capability: 'Immutable state', core: true, react: true, mui: true },
  { capability: 'Conditions and dependencies', core: true, react: true, mui: true },
  { capability: 'Async data sources', core: true, react: true, mui: true },
  { capability: 'UI rendering', core: false, react: true, mui: true },
  { capability: 'Default visual controls', core: false, react: false, mui: true },
] as const;
export const buildSnapshot = { verified: '2026-08-23', mainKb: 437.99, sharedMuiKb: 177.16, demoShellKb: 20.88, quickstartKb: 1.39, basicFormKb: 1.96, budgetKb: 500, source: 'Vite production output; uncompressed JavaScript' } as const;
export const qualitySnapshot = [
  { check: 'TypeScript', result: 'Passing', evidence: 'playground typecheck' },
  { check: 'Chromium smoke suite', result: '4/4 passing', evidence: 'docs and playground flows' },
  { check: 'Keyboard navigation', result: 'Pending', evidence: 'Section 18' },
  { check: 'Automated accessibility', result: 'Pending', evidence: 'Section 18' },
  { check: 'Benchmark', result: 'Not established', evidence: 'Section 19' },
] as const;
export const recentChanges = [
  { title: 'Enterprise playground shell', detail: 'Responsive navigation, themes, deep links, and lazy routes.' },
  { title: 'Shared DemoShell', detail: 'Schema editing, runtime inspection, controls, and test steps.' },
  { title: 'MUI mask field', detail: 'Registered enterprise behavior with tests.' },
] as const;
