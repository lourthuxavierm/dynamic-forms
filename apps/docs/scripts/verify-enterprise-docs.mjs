import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const enterprise = resolve(docsRoot, 'enterprise');
const failures = [];
const topics = [
  'backend-driven-schemas', 'schema-governance', 'permissions', 'localization',
  'multi-step-workflows', 'drafts-and-autosave', 'audit-and-observability',
  'server-validation', 'file-uploads', 'accessibility-governance',
  'design-systems', 'performance', 'testing-and-deployment', 'adoption-checklist',
];

for (const topic of topics) {
  const path = resolve(enterprise, `${topic}.md`);
  if (!existsSync(path)) failures.push(`${topic}: missing enterprise guide`);
}

const all = ['index', ...topics]
  .filter((topic) => existsSync(resolve(enterprise, `${topic}.md`)))
  .map((topic) => readFileSync(resolve(enterprise, `${topic}.md`), 'utf8'))
  .join('\n');

for (const expectation of [
  'not security controls', 'authoritative server', 'schema version', 'idempotency',
  'correlation ID', 'malware scanning', 'screen-reader', 'performance budgets',
  'rollback', 'data classification',
]) {
  if (!all.toLowerCase().includes(expectation.toLowerCase())) failures.push(`missing enterprise expectation: ${expectation}`);
}

const checklist = readFileSync(resolve(enterprise, 'adoption-checklist.md'), 'utf8');
const checklistItems = checklist.match(/^- \[ \]/gm)?.length ?? 0;
if (checklistItems < 15) failures.push(`adoption checklist has ${checklistItems} items; expected at least 15`);

if (failures.length) {
  console.error(`Enterprise documentation verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Enterprise documentation verification passed: ${topics.length} guides and ${checklistItems} adoption controls.`);
