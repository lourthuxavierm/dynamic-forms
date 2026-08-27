import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const documentationRoot = resolve(repositoryRoot, 'apps/docs/integrations/native-html');
const requiredPages = [
  'index', 'installation', 'rendering', 'form-values', 'events', 'validation',
  'custom-controls', 'styling', 'accessibility', 'testing', 'complete-example',
];
const failures = [];
const documents = new Map();

for (const page of requiredPages) {
  const path = resolve(documentationRoot, `${page}.md`);
  if (!existsSync(path)) {
    failures.push(`integrations/native-html/${page}.md: missing canonical page`);
    continue;
  }
  const markdown = readFileSync(path, 'utf8');
  documents.set(page, markdown);
  for (const label of ['Status', 'Owner', 'Last verified', 'Applies to']) {
    if (!new RegExp(`^- ${label}:\\s*\\S`, 'm').test(markdown)) {
      failures.push(`integrations/native-html/${page}.md: missing ${label}`);
    }
  }
}

const packageManifest = JSON.parse(readFileSync(resolve(repositoryRoot, 'packages/html/package.json'), 'utf8'));
const packageIndex = readFileSync(resolve(repositoryRoot, 'packages/html/src/index.ts'), 'utf8').trim();
const installation = documents.get('installation') ?? '';
const landing = documents.get('index') ?? '';
const example = documents.get('complete-example') ?? '';
const combined = [...documents.values()].join('\n');

if (packageManifest.description !== 'Compatibility package forwarding to @dynamic-forms/react-html') {
  failures.push('packages/html/package.json: compatibility description changed; review Native HTML docs');
}
if (packageManifest.dependencies?.['@dynamic-forms/react-html'] !== 'workspace:*') {
  failures.push('packages/html/package.json: expected direct @dynamic-forms/react-html dependency');
}
for (const peer of ['@dynamic-forms/core', '@dynamic-forms/react', 'react', 'react-dom']) {
  if (!packageManifest.peerDependencies?.[peer]) failures.push(`packages/html/package.json: missing ${peer} peer dependency`);
}
if (packageIndex !== "export * from '@dynamic-forms/react-html';") {
  failures.push('packages/html/src/index.ts: forwarding boundary changed; review Native HTML docs');
}
if (!landing.includes('There is currently no framework-independent renderer')) failures.push('index.md: missing current availability statement');
if (!installation.includes('There is nothing to install for standalone Native HTML/DOM today')) failures.push('installation.md: missing no-install statement');
if (!example.includes('no runnable standalone example exists')) failures.push('complete-example.md: missing example availability statement');
if (combined.includes('@dynamic-forms/native-html') || combined.includes('@dynamic-forms/dom')) failures.push('Native HTML docs contain an invented package name');
if (/```(?:sh|bash|shell)[\s\S]*?pnpm add[\s\S]*?```/.test(installation)) failures.push('installation.md: must not publish an install command before implementation');

if (failures.length) {
  console.error(`Native HTML documentation verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Native HTML documentation verification passed: ${requiredPages.length} canonical pages and the compatibility boundary match source.`);
