/** Task-oriented navigation shared by the active VitePress configuration. */
export const phase1Nav = [
  { text: 'Guides', link: '/guides/' },
  { text: 'Integrations', link: '/integrations/' },
  { text: 'Controls', link: '/controls/' },
  { text: 'Enterprise', link: '/enterprise/' },
  { text: 'API', link: '/api/' },
  { text: 'Playground', link: '/playground/' },
] as const;

export const phase1Sidebar = [
  {
    text: 'Getting started', collapsed: false, items: [
      { text: 'Introduction', link: '/getting-started/introduction' },
      { text: 'Choose an integration', link: '/getting-started/choose-an-integration' },
      { text: 'Installation', link: '/getting-started/installation' },
      { text: 'First schema', link: '/getting-started/first-schema' },
      { text: 'First form', link: '/getting-started/first-form' },
      { text: 'Validation', link: '/getting-started/validation' },
      { text: 'Submission', link: '/getting-started/submission' },
      { text: 'Next steps', link: '/getting-started/next-steps' },
    ],
  },
  {
    text: 'Integrations', collapsed: false, items: [
      { text: 'Integration index', link: '/integrations/' },
      { text: 'React', link: '/integrations/react/' },
      { text: 'React HTML', link: '/integrations/react-html/' },
      { text: 'Angular (Experimental)', link: '/integrations/angular/' },
      { text: 'Angular HTML (Experimental)', link: '/integrations/angular-html/' },
      { text: 'Native HTML/DOM (Planned)', link: '/integrations/native-html/' },
    ],
  },
  {
    text: 'Angular (Experimental)', collapsed: true, items: [
      { text: 'Overview', link: '/integrations/angular/' },
      { text: 'Installation', link: '/integrations/angular/installation' },
      { text: 'Providers', link: '/integrations/angular/providers' },
      { text: 'Dynamic form', link: '/integrations/angular/dynamic-form' },
      { text: 'Signals and state', link: '/integrations/angular/form-state' },
      { text: 'RxJS', link: '/integrations/angular/rxjs' },
      { text: 'Reactive Forms', link: '/integrations/angular/reactive-forms' },
      { text: 'Validation', link: '/integrations/angular/validation' },
      { text: 'Customization', link: '/integrations/angular/customization' },
      { text: 'Testing', link: '/integrations/angular/testing' },
    ],
  },
  {
    text: 'Angular HTML (Experimental)', collapsed: true, items: [
      { text: 'Overview', link: '/integrations/angular-html/' },
      { text: 'Installation', link: '/integrations/angular-html/installation' },
      { text: 'HTML form', link: '/integrations/angular-html/html-form' },
      { text: 'Controls', link: '/integrations/angular-html/controls' },
      { text: 'Layouts', link: '/integrations/angular-html/layouts' },
      { text: 'Styling', link: '/integrations/angular-html/styling' },
      { text: 'Accessibility', link: '/integrations/angular-html/accessibility' },
      { text: 'SSR and hydration', link: '/integrations/angular-html/ssr' },
      { text: 'Complete example', link: '/integrations/angular-html/complete-example' },
    ],
  },
  {
    text: 'React', collapsed: true, items: [
      { text: 'Overview', link: '/integrations/react/' },
      { text: 'Installation', link: '/integrations/react/installation' },
      { text: 'FormProvider', link: '/integrations/react/form-provider' },
      { text: 'Dynamic components', link: '/integrations/react/dynamic-components' },
      { text: 'Hooks', link: '/integrations/react/hooks' },
      { text: 'Validation', link: '/integrations/react/validation' },
      { text: 'Custom controls', link: '/integrations/react/custom-controls' },
      { text: 'Accessibility', link: '/integrations/react/accessibility' },
      { text: 'SSR and lifecycle', link: '/integrations/react/ssr' },
      { text: 'Performance', link: '/integrations/react/performance' },
      { text: 'Testing', link: '/integrations/react/testing' },
    ],
  },
  {
    text: 'React HTML', collapsed: true, items: [
      { text: 'Overview', link: '/integrations/react-html/' },
      { text: 'Installation and example', link: '/integrations/react-html/installation' },
      { text: 'HtmlForm', link: '/integrations/react-html/html-form' },
      { text: 'Controls', link: '/integrations/react-html/controls' },
      { text: 'Custom controls', link: '/integrations/react-html/custom-controls' },
      { text: 'Layouts', link: '/integrations/react-html/layouts' },
      { text: 'Styling', link: '/integrations/react-html/styling' },
      { text: 'Accessibility', link: '/integrations/react-html/accessibility' },
      { text: 'SSR and hydration', link: '/integrations/react-html/ssr' },
      { text: 'Performance', link: '/integrations/react-html/performance' },
      { text: 'Testing', link: '/integrations/react-html/testing' },
      { text: 'Deep references', link: '/integrations/react-html/deep-references' },
    ],
  },
  {
    text: 'Architecture', collapsed: true, items: [
      { text: 'Angular architecture', link: '/architecture/angular/' },
      { text: 'Signals and RxJS', link: '/architecture/angular/signals-and-rxjs' },
      { text: 'Reactive Forms', link: '/architecture/angular/reactive-forms' },
      { text: 'Zoneless change detection', link: '/architecture/angular/change-detection' },
      { text: 'SSR and hydration', link: '/architecture/angular/ssr-and-hydration' },
      { text: 'Testing and release', link: '/architecture/angular/testing-and-release' },
    ],
  },
  {
    text: 'Reference', collapsed: true, items: [
      { text: 'Schema', link: '/schema/' }, { text: 'Runtime', link: '/runtime/' },
      { text: 'Controls', link: '/controls/' }, { text: 'API', link: '/api/' },
      { text: 'Playground', link: '/playground/' },
    ],
  },
  {
    text: 'Packages', collapsed: true, items: [
      { text: 'Core', link: '/packages/core' }, { text: 'React', link: '/packages/react' },
      { text: 'React HTML', link: '/packages/react-html' }, { text: 'Zod', link: '/packages/zod' },
      { text: 'React Hook Form', link: '/packages/react-hook-form' },
      { text: 'JSON Schema', link: '/packages/json-schema' }, { text: 'DevTools', link: '/packages/devtools' },
    ],
  },
  {
    text: 'Project information', collapsed: true, items: [
      { text: 'Project baseline', link: '/project/' },
      { text: 'Feature maturity', link: '/project/feature-maturity' },
      { text: 'Framework compatibility', link: '/project/framework-compatibility' },
      { text: 'Angular compatibility', link: '/project/angular-compatibility' },
      { text: 'Terminology', link: '/project/terminology' },
      { text: 'Documentation ownership', link: '/project/documentation-ownership' },
      { text: 'Documentation standards', link: '/documentation-standards' },
      { text: 'Inventory and traceability', link: '/documentation-inventory' },
      { text: 'Phase 8 status', link: '/project/phase-8-status' },
      { text: 'Phase 9 status', link: '/project/phase-9-status' },
      { text: 'Phase 10 status', link: '/project/phase-10-status' },
    ],
  },
] as const;
