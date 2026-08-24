import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('../src/styles/default.css', import.meta.url));
const css = readFileSync(path, 'utf8');
const required = [
  '@layer dynamic-forms',
  ':where(',
  '--df-color-primary',
  '--df-color-error',
  '--df-field-gap',
  '--df-control-height',
  '--df-border-radius',
  'var(--df-color-primary)',
  'prefers-color-scheme: dark',
  'data-df-color-scheme="dark"',
  'data-df-density="compact"',
  'data-df-density="comfortable"',
  '[dir="rtl"]',
  'forced-colors: active',
  'prefers-reduced-motion: reduce',
];
const missing = required.filter((contract) => !css.includes(contract));
if (missing.length) throw new Error(`Default stylesheet is missing contracts: ${missing.join(', ')}`);
if (css.includes('!important')) throw new Error('Default stylesheet must not use !important.');
if (/createElement\(['"]style|insertRule|CSSStyleSheet/.test(css)) throw new Error('Runtime CSS APIs are forbidden.');
console.log('HTML stylesheet contracts are valid.');
