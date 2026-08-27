import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const required = [
  'support/index.md', 'support/troubleshooting/index.md',
  'support/troubleshooting/error-index.md', 'support/support-feedback.md',
  'support/release-readiness.md', 'migration/index.md',
  'migration/schema-versions.md', 'migration/html-to-react-html.md',
  'migration/react-major-versions.md', 'migration/angular-major-versions.md',
  'migration/package-major-versions.md',
];
const failures = [];
const pages = new Map();

for (const file of required) {
  const path = resolve(root, file);
  if (!existsSync(path)) failures.push(`${file}: missing`);
  else pages.set(file, readFileSync(path, 'utf8'));
}

const troubleshooting = pages.get('support/troubleshooting/index.md') ?? '';
for (const heading of ['Symptom:', 'Likely cause:', 'How to confirm:', 'Resolution:', 'Preventive guidance:', 'Related API, test, or issue:']) {
  if (!troubleshooting.includes(heading)) failures.push(`troubleshooting template missing ${heading}`);
}

const index = pages.get('support/troubleshooting/error-index.md') ?? '';
for (const term of ['Hydration failed', 'Unknown field type', 'form renders no fields', 'submitted values are stale']) {
  if (!index.toLowerCase().includes(term.toLowerCase())) failures.push(`error index missing searchable term: ${term}`);
}

const combined = [...pages.values()].join('\n').toLowerCase();
for (const expectation of ['schema version', 'html compatibility', 'react major', 'angular major', 'rollback', 'regression test', 'exact error text']) {
  if (!combined.includes(expectation)) failures.push(`operational support missing expectation: ${expectation}`);
}

const releaseChecks = (pages.get('support/release-readiness.md') ?? '').match(/^- \[ \]/gm)?.length ?? 0;
if (releaseChecks < 8) failures.push(`release checklist has ${releaseChecks} checks; expected at least 8`);

if (failures.length) {
  console.error(`Operational support verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Operational support verification passed: ${required.length} pages, searchable symptom index, and ${releaseChecks} release gates.`);
