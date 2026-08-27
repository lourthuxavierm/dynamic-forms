import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const schemaRoot = resolve(docsRoot, 'schema');
const failures = [];
const requiredPages = [
  'index', 'overview', 'form-schema', 'field-schema', 'default-values',
  'validation', 'conditions', 'dependencies', 'data-sources', 'metadata',
  'nested-objects', 'arrays', 'layouts', 'versioning',
];

for (const page of requiredPages) {
  const path = resolve(schemaRoot, `${page}.md`);
  if (!existsSync(path)) {
    failures.push(`schema/${page}.md: missing canonical page`);
    continue;
  }
  const markdown = readFileSync(path, 'utf8');
  for (const label of ['Status', 'Owner', 'Last verified', 'Applies to']) {
    if (!new RegExp(`^- ${label}:\\s*\\S`, 'm').test(markdown)) failures.push(`schema/${page}.md: missing ${label}`);
  }
}

const fieldReference = readFileSync(resolve(schemaRoot, 'field-schema.md'), 'utf8');
const fieldProperties = [
  'name', 'type', 'label', 'defaultValue', 'placeholder', 'description',
  'disabled', 'readOnly', 'visibleWhen', 'disabledWhen', 'requiredWhen',
  'readOnlyWhen', 'hiddenValuePolicy', 'dependsOn', 'resetOnDependencyChange',
  'dataSource', 'options', 'config', 'validation', 'fields', 'metadata',
];
for (const property of fieldProperties) {
  if (!fieldReference.includes(`\`${property}\``)) failures.push(`schema/field-schema.md: missing FieldSchema.${property}`);
}

const formReference = readFileSync(resolve(schemaRoot, 'form-schema.md'), 'utf8');
for (const property of ['id', 'fields', 'version']) {
  if (!formReference.includes(`\`${property}\``)) failures.push(`schema/form-schema.md: missing FormSchema.${property}`);
}

const layouts = readFileSync(resolve(schemaRoot, 'layouts.md'), 'utf8');
if (!layouts.includes('`FormSchema` has no layout property')) failures.push('schema/layouts.md: missing renderer-boundary statement');

const versioning = readFileSync(resolve(schemaRoot, 'versioning.md'), 'utf8');
if (!versioning.includes('does not') || !versioning.includes('migrate')) failures.push('schema/versioning.md: missing migration limitation');

if (failures.length) {
  console.error(`Schema documentation verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Schema documentation verification passed: ${requiredPages.length} canonical pages and ${fieldProperties.length} FieldSchema properties.`);
