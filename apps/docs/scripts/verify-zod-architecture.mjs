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
  'apps/docs/public/examples/zod-validation.png',
  'apps/docs/tests/zod-architecture.spec.ts',
  'apps/docs/tests/example-catalogue.spec.ts',
  'apps/docs/tests/angular-implementation.spec.ts',
  'apps/docs/zod-playground.config.ts',
  'packages/zod/README.md',
  'packages/zod/RELEASE.md',
  'scripts/verify-zod-release.mjs',
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
if (manifest.name !== '@lourthuxavierm/dynamic-forms-zod') failures.push('Zod package name mismatch');
if (manifest.dependencies?.['@lourthuxavierm/dynamic-forms-core'] !== 'workspace:*') failures.push('Zod adapter must depend on Core');
if (manifest.peerDependencies?.zod !== '^3.25.5 || ^4.0.0') failures.push('Zod peer matrix must be ^3.25.5 || ^4.0.0');
for (const forbidden of ['@lourthuxavierm/dynamic-forms-react', '@lourthuxavierm/dynamic-forms-react-html', '@lourthuxavierm/dynamic-forms-angular', '@lourthuxavierm/dynamic-forms-angular-html']) {
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
if (manifest.publishConfig?.access !== 'public') failures.push('Zod package must publish with public access');
if (!manifest.files?.includes('RELEASE.md')) failures.push('Zod package must publish its release process');
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
  if (!matrix.includes(`@lourthuxavierm/dynamic-forms-zod ${command}`)) failures.push(`Zod matrix missing ${command} command`);
}
if (!matrix.includes('needs: [adapter, playground-evidence]') || !matrix.includes('pnpm verify:zod-release')) failures.push('Zod CI release gate must depend on compatibility and playground evidence');
for (const expectation of [
  'playground-evidence:',
  'pnpm exec playwright install --with-deps chromium',
  'playwright test --config zod-playground.config.ts --grep Zod',
]) {
  if (!matrix.includes(expectation)) failures.push(`Zod browser matrix missing: ${expectation}`);
}

const rootManifest = JSON.parse(read('package.json'));
if (rootManifest.scripts?.['verify:zod-release'] !== 'node scripts/verify-zod-release.mjs') failures.push('root Zod release command is missing');

const decision = required.slice(0, 2).map(read).join('\n');
for (const expectation of [
  'validation-only', '_form', 'contacts[0].email', 'first',
  'safeParseAsync', '^3.25.5', '^4.0.0',
  'Release-ready for the documented 0.1.x contract',
  'Run the matrix-dependent release verifier again',
  'Successful Zod output is discarded',
  'Phase 4 field validation',
  'Rules that compare multiple values belong',
  'Phase 5 compatibility matrix',
  'Phase 6 integration examples',
  'Phase 7 generated API reference',
  'Phase 8 migration guidance',
  'Phase 9 release verifier',
  'Phase 10 renderer playground integration',
  'Phase 11 deterministic visual evidence',
  'Phase 12 cross-renderer browser release gate',
]) {
  if (!decision.toLowerCase().includes(expectation.toLowerCase())) failures.push(`Zod decision missing: ${expectation}`);
}

const guide = read('apps/docs/integrations/zod.md');
for (const expectation of [
  'FrameworkAvailability', 'FrameworkTabs', 'profileStore.validate(validateProfile)',
  'profileStore.submit(saveProfile, validateProfile)', 'formValidator: validateProfile',
  'Standalone Native HTML/DOM rendering is planned', 'Validate again on the server',
]) {
  if (!guide.includes(expectation)) failures.push(`Zod integration guide missing: ${expectation}`);
}

const api = read('apps/docs/api/generated/zod.md');
for (const expectation of [
  'Maturity: Release-ready', 'createZodFormValidator', 'createZodFieldValidator',
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

const reactProvider = read('packages/react/src/context/FormContext.tsx');
const angularFacade = read('packages/angular/src/facade.ts');
const catalogue = read('packages/examples/src/catalogue.ts');
if (!reactProvider.includes('formValidator?: FormValidator<T>')) failures.push('React FormProvider custom form validator hook is missing');
if (!angularFacade.includes('formValidator?: FormValidator<T>')) failures.push('Angular facade custom form validator hook is missing');
if (!catalogue.includes("item('zod-validation'")) failures.push('shared Zod playground example is missing');
const capture = read('apps/docs/scripts/capture-example-screenshots.mjs');
if (!capture.includes("id === 'zod-validation'") || !capture.includes("getByRole('alert')")) failures.push('deterministic Zod error-state capture is missing');
for (const testPath of ['apps/docs/tests/example-catalogue.spec.ts', 'apps/docs/tests/angular-implementation.spec.ts']) {
  const browserTest = read(testPath);
  if (!browserTest.includes('engineer@example.com') || !browserTest.includes('Submit Zod validation')) failures.push(`${testPath}: Zod invalid-to-valid browser scenario is missing`);
}

if (failures.length) {
  console.error(`Zod architecture verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Zod Phase 12 verification passed: release-ready adapter plus matrix-dependent React and Angular browser evidence.');
