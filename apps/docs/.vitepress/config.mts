import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitepress';

const repository = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
) as { version: string };

export default defineConfig({
  title: 'Dynamic Forms',
  description: 'Enterprise documentation for the Dynamic Forms packages',
  cleanUrls: true,
  lastUpdated: true,
  metaChunk: true,
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Dynamic Forms',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting started', link: '/getting-started/introduction' },
      { text: 'Standards', link: '/documentation-standards' },
      { text: 'Inventory', link: '/documentation-inventory' },
      { text: `v${repository.version}`, items: [{ text: 'Pre-1.0 development', link: '/documentation-inventory#package-traceability' }] },
    ],
    sidebar: [
      {
        text: 'Getting started',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Quick start', link: '/getting-started/quick-start' },
          { text: 'Schema basics', link: '/getting-started/schema-basics' },
          { text: 'React setup', link: '/getting-started/react-setup' },
        ],
      },
      {
        text: 'Foundations',
        collapsed: false,
        items: [
          { text: 'Core runtime', link: '/concepts/core-runtime' },
          { text: 'Conditions and data sources', link: '/concepts/runtime-behavior' },
          { text: 'Custom fields and validation', link: '/concepts/customization' },
        ],
      },
      {
        text: 'Packages',
        collapsed: false,
        items: [
          { text: 'Core', link: '/packages/core' },
          { text: 'React', link: '/packages/react' },
          { text: 'React HTML', link: '/packages/react-html' },
          { text: 'Zod', link: '/packages/zod' },
          { text: 'React Hook Form', link: '/packages/react-hook-form' },
          { text: 'JSON Schema', link: '/packages/json-schema' },
          { text: 'DevTools', link: '/packages/devtools' },
        ],
      },      {
        text: 'Documentation',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Standards', link: '/documentation-standards' },
          { text: 'Inventory and traceability', link: '/documentation-inventory' },
        ],
      },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    editLink: {
      pattern: 'https://github.com/lourthuxavierm/dynamic-forms/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/lourthuxavierm/dynamic-forms' }],
    footer: {
      message: 'Pre-1.0 documentation. Verify maturity labels before adoption.',
      copyright: 'Released under the MIT License.',
    },
  },
});
