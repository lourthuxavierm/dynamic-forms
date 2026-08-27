import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitepress';
import { phase1Nav, phase1Sidebar } from './phase1-navigation.mjs';
import { phase11Sidebar } from './phase11-navigation.mjs';
import { phase13Sidebar } from './phase13-navigation.mjs';
import { phase14Sidebar } from './phase14-navigation.mjs';
import { phase15Sidebar } from './phase15-navigation.mjs';

const repository = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  title: 'Dynamic Forms', description: 'Enterprise documentation for the Dynamic Forms packages',
  cleanUrls: true, lastUpdated: true, metaChunk: true,
  themeConfig: {
    logo: '/logo.svg', siteTitle: 'Dynamic Forms',
    nav: [...phase1Nav, { text: `v${repository.version}`, items: [{ text: 'Pre-1.0 development', link: '/documentation-inventory#package-traceability' }] }],
    sidebar: [phase15Sidebar, phase14Sidebar, phase13Sidebar, phase11Sidebar, ...phase1Sidebar],
    search: { provider: 'local' }, outline: { level: [2, 3] },
    editLink: { pattern: 'https://github.com/lourthuxavierm/dynamic-forms/edit/main/apps/docs/:path', text: 'Edit this page on GitHub' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/lourthuxavierm/dynamic-forms' }],
    footer: { message: 'Pre-1.0 documentation. Verify maturity labels before adoption.', copyright: 'Released under the MIT License.' },
  },
});
