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
  'apps/docs/integrations/zod.md',
  'apps/docs/api/generated/zod.md',
  'apps/docs/migration/zod-adapter.md',
  'apps/docs/tests/zod-architecture.spec.ts',
  'packages/zod/README.md',
  'packages/zod/tsconfig.json',
  'packages/zod/tsconfig.build.json',
  'packages/zod/src/types.ts',
  'packages/zod/src/paths.ts',
  'packages/zod/src/issues.ts',
  'packages/zod/src/formValidator.ts',
  'packages/zod/src/fieldValidator.ts',
  'packages/zod/src/public-api.test.ts',
  'packages/zod/src/paths.test.ts',
  'packages/zod/src/issues.test.ts',
  'packages/zod/src/formValidator.test.ts',
  'packages/zod/src/fieldValidator.test.ts',
  'packages/zod/src/coreIntegration.test.ts',
  '.github/workflows/zod-compatibility.yml',
];
for (const file of required) if (!existsSync(resolve(repoRoot, file))) failures.push(`${file}: missing`);

const manifest = JSON.parse(read('packages/zod/package.json'));
if (manifest.name !== '@dynamic-forms/zod') failures.push('Zod package name mismatch');
if (manifest.dependencies?.['@dynamic-forms/core'] !== 'workspace:*') failures.push('Zod adapter must depend on Core');
if (manifest.peerDependencies?.zod !== '^3.25.5 || ^4.0.0') failures.push('Zod peer matrix must be ^3.25.5 || ^4.0.0');
for (const forbidden of ['@dynamic-forms/react', '@dynamic-forms/react-html', '@dynamic-forms/angular', '@dynamic-forms/angular-html']) {
  if (manifest.dependencies?.[forbidden]) failures.push(`Zod adapter must not depend on ${forbidden}`);
}

const source = read('packages/zod/src/index.ts');
if (source.includes('ZOD_ADAPTER')) failures.push('Phase 4 must keep the retired placeholder marker removed');
if (!source.includes('createZodFormValidator')) failures.push('Phase 3 form validator must be public');
if (!source.includes('createZodFieldValidator')) failures.push('Phase 4 field validator must be public');
for (const typeName of ['ZodSchemaLike', 'ZodIssueLike', 'ZodAdapterOptions', 'ZodSafeParseResult']) {
  if (!source.includes(typeName)) failures.push(`Phase 1 public types missing: ${typeName}`);
}
for (const functionName of ['zodPathToFieldPath', 'zodIssueToValidationIssue', 'normalizeZodIssue', 'zodIssuesToFormErrors']) {
  if (!source.includes(functionName)) failures.push(`Phase 2 public mapping missing: ${functionName}`);
}
if (manifest.sideEffects !== false) failures.push('Zod package must declare sideEffects false');
if (manifest.devDependencies?.zod !== '4.4.3') failures.push('Zod package must pin the development compiler/test version');
if (!manifest.scripts?.build?.includes('tsconfig.build.json')) failures.push('Zod build must emit declarations');
if (!manifest.scripts?.test || manifest.scripts.test.includes('passWithNoTests')) failures.push('Zod tests must be required');

const coreSurface = read('packages/core/package.json') + read('packages/core/src/index.ts');
if (/\bzod\b/i.test(coreSurface)) failures.push('Core must remain independent of Zod');

const matrix = read('.github/workflows/zod-compatibility.yml');
for (const version of ['3.25.5', '3.25.76', '4.0.0', '4.5.1']) {
  if (!matrix.includes(`"${version}"`)) failures.push(`Zod matrix missing pinned version: ${version}`);
}
for (const command of ['typecheck', 'test', 'build']) {
  if (!matrix.includes(`@dynamic-forms/zod ${command}`)) failures.push(`Zod matrix missing ${command} command`);
}

const decision = required.slice(0, 2).map(read).join('\n');
for (const expectation of [
  'validation-only', '_form', 'contacts[0].email', 'first',
  'safeParseAsync', '^3.25.5', '^4.0.0',
  'Experimental status remains',
  'Form and field validation Experimental',
  'Successful Zod output is discarded',
  'Phase 4 field validation',
  'Rules that compare multiple values belong',
  'Phase 5 compatibility matrix',
  'Phase 6 integration examples',
  'Phase 7 generated API reference',
  'Phase 8 migration guidance',
]) {
  if (!decision.toLowerCase().includes(expectation.toLowerCase())) failures.push(`Zod decision missing: ${expectation}`);
}

const guide = read('apps/docs/integrations/zod.md');
for (const expectation of [
  'FrameworkAvailability', 'FrameworkTabs', 'profileStore.validate(validateProfile)',
  'profileStore.submit(saveProfile, validateProfile)', 'form.store.validate(validateProfile)',
  'Standalone Native HTML/DOM rendering is planned', 'Validate again on the server',
]) {
  if (!guide.includes(expectation)) failures.push(`Zod integration guide missing: ${expectation}`);
}

const api = read('apps/docs/api/generated/zod.md');
for (const expectation of [
  'Maturity: Experimental', 'createZodFormValidator', 'createZodFieldValidator',
  'zodIssuesToFormErrors', 'zodPathToFieldPath',
]) {
  if (!api.includes(expectation)) failures.push(`Generated Zod API missing: ${expectation}`);
}

const migration = read('apps/docs/migration/zod-adapter.md');
for (const expectation of [
  'Preserve transformed submission data', 'profileSchema.parseAsync(values)',
  'Canary and stop conditions', 'Rollback', 'requires no data conversion',
  'server validation remains authoritative',
]) {
  if (!migration.toLowerCase().includes(expectation.toLowerCase())) failures.push(`Zod migration guide missing: ${expectation}`);
}

if (failures.length) {
  console.error(`Zod architecture verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Zod Phase 8 verification passed: adapter behavior, compatibility, integration/API documentation, and migration/rollback guidance.');
