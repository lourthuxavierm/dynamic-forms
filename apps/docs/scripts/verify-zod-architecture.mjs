import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(docsRoot, '../..');
const failures = [];
const read = (path) => readFileSync(resolve(repoRoot, path), 'utf8');
const required = [
  'docs/architecture/decisions/zod-adapter.md',
  'apps/docs/project/zod-compatibility.md',
  'apps/docs/tests/zod-architecture.spec.ts',
];
for (const file of required) if (!existsSync(resolve(repoRoot, file))) failures.push(`${file}: missing`);

const manifest = JSON.parse(read('packages/zod/package.json'));
if (manifest.name !== '@dynamic-forms/zod') failures.push('Zod package name mismatch');
if (manifest.dependencies?.['@dynamic-forms/core'] !== 'workspace:*') failures.push('Zod adapter must depend on Core');
if (manifest.peerDependencies?.zod !== '^3.25.0 || ^4.0.0') failures.push('candidate Zod peer matrix must be ^3.25.0 || ^4.0.0');
for (const forbidden of ['@dynamic-forms/react', '@dynamic-forms/react-html', '@dynamic-forms/angular', '@dynamic-forms/angular-html']) {
  if (manifest.dependencies?.[forbidden]) failures.push(`Zod adapter must not depend on ${forbidden}`);
}

const source = read('packages/zod/src/index.ts');
if (!source.includes('ZOD_ADAPTER = true')) failures.push('Phase 0 must retain the placeholder marker');
if (/createZod(Form|Field)Validator/.test(source)) failures.push('Phase 0 must not publish an unimplemented validator API');

const coreSurface = read('packages/core/package.json') + read('packages/core/src/index.ts');
if (/\bzod\b/i.test(coreSurface)) failures.push('Core must remain independent of Zod');

const decision = required.slice(0, 2).map(read).join('\n');
for (const expectation of [
  'validation-only', '_form', 'contacts[0].email', 'first',
  'safeParseAsync', '^3.25.0', '^4.0.0', 'Not certified',
  'Do not import it',
]) {
  if (!decision.toLowerCase().includes(expectation.toLowerCase())) failures.push(`Zod decision missing: ${expectation}`);
}

if (failures.length) {
  console.error(`Zod architecture verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Zod architecture verification passed: placeholder truth, package boundary, error semantics, and candidate v3/v4 matrix.');
