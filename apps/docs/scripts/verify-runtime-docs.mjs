import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const runtimeRoot = resolve(repositoryRoot, 'apps/docs/runtime');
const failures = [];
const requiredPages = [
  'index', 'form-lifecycle', 'form-store', 'form-state', 'field-state', 'events',
  'subscriptions', 'conditions', 'dependencies', 'data-sources', 'cache',
  'cancellation', 'reset', 'submission',
];

const documents = new Map();
for (const page of requiredPages) {
  const path = resolve(runtimeRoot, `${page}.md`);
  if (!existsSync(path)) {
    failures.push(`runtime/${page}.md: missing canonical page`);
    continue;
  }
  const markdown = readFileSync(path, 'utf8');
  documents.set(page, markdown);
  for (const label of ['Status', 'Owner', 'Last verified', 'Applies to']) {
    if (!new RegExp(`^- ${label}:\\s*\\S`, 'm').test(markdown)) failures.push(`runtime/${page}.md: missing ${label}`);
  }
}

const stateSource = readFileSync(resolve(repositoryRoot, 'packages/core/src/store/types.ts'), 'utf8');
const stateBlock = /interface FormState[^\{]*\{([\s\S]*?)\n\}/.exec(stateSource)?.[1] ?? '';
const stateProperties = [...stateBlock.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]);
const stateDocs = documents.get('form-state') ?? '';
for (const property of stateProperties) {
  if (!stateDocs.includes(`\`${property}\``)) failures.push(`runtime/form-state.md: missing FormState.${property}`);
}

const eventSource = readFileSync(resolve(repositoryRoot, 'packages/core/src/events/types.ts'), 'utf8');
const eventTypes = [...eventSource.matchAll(/'([^']+)'/g)].map((match) => match[1]);
const eventDocs = documents.get('events') ?? '';
for (const event of eventTypes) {
  if (!eventDocs.includes(`\`${event}\``)) failures.push(`runtime/events.md: missing event ${event}`);
}

const combined = [...documents.values()].join('\n');
for (const contract of [
  'setValue', 'setValues', 'setError', 'clearError', 'setTouched', 'validate',
  'submit', 'reset', 'resetField', 'subscribe', 'subscribeToField',
  'ConditionController', 'DependencyController', 'DataSourceManager',
]) {
  if (!combined.includes(contract)) failures.push(`runtime reference: missing public contract ${contract}`);
}

if (!(documents.get('form-lifecycle') ?? '').includes('emit valueChange')) failures.push('runtime/form-lifecycle.md: missing valueChange ordering');
if (!(documents.get('submission') ?? '').includes('It does not call `FormProvider.submit()`')) failures.push('runtime/submission.md: missing HtmlForm submission boundary');
if (!(documents.get('cancellation') ?? '').includes('Cancellation is cooperative')) failures.push('runtime/cancellation.md: missing cooperative cancellation limitation');

if (failures.length) {
  console.error(`Runtime documentation verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Runtime documentation verification passed: ${requiredPages.length} canonical pages, ${stateProperties.length} state properties, and ${eventTypes.length} event types.`);
