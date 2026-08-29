import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = resolve(docsRoot, '..', '..');
const source = readFileSync(resolve(root, 'packages/examples/src/catalogue.ts'), 'utf8');
const docs = readFileSync(resolve(docsRoot, 'playground/index.md'), 'utf8');
const tests = readFileSync(resolve(docsRoot, 'tests/example-catalogue.spec.ts'), 'utf8');
const ids = [...source.matchAll(/item\('([^']+)'/g)].map((match) => match[1]);
const failures = [];
if (ids.length !== 15 || new Set(ids).size !== 15) failures.push(`expected 15 unique catalogue IDs, found ${ids.length}`);
for (const id of ids) {
  if (!docs.includes(`\`${id}\``)) failures.push(`${id}: missing documentation row`);
  if (!tests.includes(`['${id}',`)) failures.push(`${id}: missing browser coverage`);
}
for (const image of ['basic-form.png', 'validation-errors.png', 'enterprise-profile.png']) {
  if (!existsSync(resolve(docsRoot, 'public', 'examples', image))) failures.push(`${image}: deterministic screenshot missing`);
}
for (const phrase of ['Form state', 'Event log', 'Reset example', 'simulated-application-service']) {
  if (!`${docs}\n${readFileSync(resolve(root, 'apps/react-html-playground/src/App.tsx'), 'utf8')}`.includes(phrase)) failures.push(`missing playground capability: ${phrase}`);
}
if (failures.length) { console.error(`Example catalogue verification failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`); process.exit(1); }
console.log(`Example catalogue verification passed: ${ids.length} routes, 3 deterministic screenshots, and debug capabilities.`);
