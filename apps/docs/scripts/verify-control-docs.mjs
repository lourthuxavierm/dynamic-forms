import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const controlsRoot = resolve(repositoryRoot, 'apps/docs/controls');
const registrySource = readFileSync(resolve(repositoryRoot, 'packages/react-html/src/registry/v1.ts'), 'utf8');
const failures = [];

const groups = {
  text: ['text', 'textarea', 'password', 'email', 'url', 'hidden'],
  numeric: ['number', 'integer', 'decimal'],
  selection: ['select', 'multi-select', 'autocomplete', 'async-autocomplete', 'checkbox', 'checkbox-group', 'radio', 'radio-group', 'switch', 'toggle-button-group', 'tree-select'],
  'date-time': ['date', 'time', 'datetime', 'date-range', 'time-range', 'datetime-range', 'month', 'year'],
  specialized: ['currency', 'percentage', 'slider', 'range-slider', 'rating', 'phone', 'otp', 'pin', 'mask'],
  'file-media': ['file', 'multi-file', 'camera', 'signature', 'document-preview'],
};

const stableMatch = /V1_HTML_FIELD_TYPES\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(registrySource);
const stableTypes = [...(stableMatch?.[1].matchAll(/'([^']+)'/g) ?? [])].map((match) => match[1]);
const documentedTypes = Object.values(groups).flat();

if (stableTypes.length !== 42) failures.push(`registry/v1.ts: expected 42 stable controls, found ${stableTypes.length}`);
if (new Set(documentedTypes).size !== documentedTypes.length) failures.push('controls: a stable type appears in more than one canonical group');

for (const type of stableTypes) {
  if (!documentedTypes.includes(type)) failures.push(`controls: stable type ${type} is not assigned to a canonical page`);
}
for (const type of documentedTypes) {
  if (!stableTypes.includes(type)) failures.push(`controls: documented stable type ${type} is absent from V1_HTML_FIELD_TYPES`);
}

for (const [page, types] of Object.entries(groups)) {
  const markdown = readFileSync(resolve(controlsRoot, `${page}.md`), 'utf8');
  for (const label of ['Status', 'Owner', 'Last verified', 'Applies to']) {
    if (!new RegExp(`^- ${label}:\\s*\\S`, 'm').test(markdown)) failures.push(`controls/${page}.md: missing ${label}`);
  }
  for (const type of types) {
    if (!markdown.includes(`\`${type}\``)) failures.push(`controls/${page}.md: missing stable control ${type}`);
  }
  for (const topic of ['Stored value', 'Accessibility']) {
    if (!markdown.toLowerCase().includes(topic.toLowerCase())) failures.push(`controls/${page}.md: missing ${topic} coverage`);
  }
}

const experimental = readFileSync(resolve(controlsRoot, 'experimental.md'), 'utf8');
for (const type of ['searchable-select', 'tree-checkbox', 'toggle-button']) {
  if (!experimental.includes(`\`${type}\``)) failures.push(`controls/experimental.md: missing ${type}`);
}

const structural = readFileSync(resolve(controlsRoot, 'structural.md'), 'utf8');
for (const type of ['object', 'array']) {
  if (!structural.includes(`\`${type}\``)) failures.push(`controls/structural.md: missing ${type}`);
}

if (failures.length) {
  console.error(`Control documentation verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Control documentation verification passed: ${stableTypes.length} stable controls across ${Object.keys(groups).length} canonical groups.`);
