import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const angular = json('packages/angular/package.json');
const html = json('packages/angular-html/package.json');
const playground = json('apps/angular-html-playground/package.json');

if (angular.name !== '@lourthuxavierm/dynamic-forms-angular' || html.name !== '@lourthuxavierm/dynamic-forms-angular-html') failures.push('Angular package names mismatch');
if (angular.dependencies?.['@lourthuxavierm/dynamic-forms-core'] !== 'workspace:*') failures.push('Angular adapter must depend on Core');
if (html.dependencies?.['@lourthuxavierm/dynamic-forms-angular'] !== 'workspace:*') failures.push('Angular HTML must depend on Angular adapter');
if (angular.dependencies?.['@lourthuxavierm/dynamic-forms-angular-html']) failures.push('headless Angular must not depend on Angular HTML');
if (!angular.peerDependencies?.['@angular/core']?.startsWith('^22.') || !html.peerDependencies?.['@angular/core']?.startsWith('^22.')) failures.push('Angular 22 peer policy missing');
if (playground.dependencies?.['@lourthuxavierm/dynamic-forms-angular-html'] !== 'workspace:*') failures.push('playground workspace dependency missing');

for (const artifact of [
  'packages/angular/dist/fesm2022/lourthuxavierm-dynamic-forms-angular.mjs',
  'packages/angular/dist/types/lourthuxavierm-dynamic-forms-angular.d.ts',
  'packages/angular-html/dist/fesm2022/lourthuxavierm-dynamic-forms-angular-html.mjs',
  'packages/angular-html/dist/types/lourthuxavierm-dynamic-forms-angular-html.d.ts',
  'packages/angular-html/dist/styles.css',
]) if (!existsSync(resolve(root, artifact))) failures.push(`${artifact}: missing partial-Ivy artifact`);

if (/angular|rxjs|zone\.js/i.test(`${read('packages/core/package.json')}\n${read('packages/core/src/index.ts')}`)) failures.push('Core contains Angular-specific code');
const angularSource = read('packages/angular/src/index.ts') + read('packages/angular/src/facade.ts') + read('packages/angular/src/di.ts') + read('packages/angular/src/forms.ts');
for (const symbol of ['DynamicFormFacade', 'createDynamicForm', 'provideDynamicForms', 'provideDynamicForm', 'injectDynamicForm', 'injectDynamicField', 'DynamicFormsValueAccessor']) if (!angularSource.includes(symbol)) failures.push(`missing ${symbol}`);
const htmlSource = read('packages/angular-html/src/index.ts') + read('packages/angular-html/src/components.ts') + read('packages/angular-html/src/registry.ts');
for (const symbol of ['DynamicHtmlFormComponent', 'DynamicHtmlFieldComponent', 'createAngularHtmlRegistry', 'ANGULAR_HTML_BASELINE_FIELD_TYPES']) if (!htmlSource.includes(symbol)) failures.push(`missing ${symbol}`);
const baseline = /ANGULAR_HTML_BASELINE_FIELD_TYPES[\s\S]*?\[([\s\S]*?)\]/.exec(read('packages/angular-html/src/registry.ts'))?.[1] ?? '';
const baselineTypes = [...baseline.matchAll(/'([^']+)'/g)].map((match) => match[1]);
if (baselineTypes.length !== 15) failures.push(`expected 15 baseline types, found ${baselineTypes.length}`);

const docs = [
  'apps/docs/integrations/angular/index.md', 'apps/docs/integrations/angular/installation.md', 'apps/docs/integrations/angular/providers.md',
  'apps/docs/integrations/angular/dynamic-form.md', 'apps/docs/integrations/angular/form-state.md', 'apps/docs/integrations/angular/rxjs.md',
  'apps/docs/integrations/angular/reactive-forms.md', 'apps/docs/integrations/angular/validation.md', 'apps/docs/integrations/angular/customization.md',
  'apps/docs/integrations/angular/testing.md', 'apps/docs/integrations/angular-html/index.md', 'apps/docs/integrations/angular-html/installation.md',
  'apps/docs/integrations/angular-html/html-form.md', 'apps/docs/integrations/angular-html/controls.md', 'apps/docs/integrations/angular-html/layouts.md',
  'apps/docs/integrations/angular-html/styling.md', 'apps/docs/integrations/angular-html/accessibility.md', 'apps/docs/integrations/angular-html/ssr.md',
  'apps/docs/integrations/angular-html/complete-example.md', 'apps/docs/project/phase-10-status.md',
];
for (const doc of docs) if (!existsSync(resolve(root, doc))) failures.push(`${doc}: missing`);
const docsText = docs.filter((path) => existsSync(resolve(root, path))).map(read).join('\n');
for (const truth of ['Experimental', '15-type baseline', 'Not yet certified', 'full phase scope in progress']) if (!docsText.toLowerCase().includes(truth.toLowerCase())) failures.push(`docs missing ${truth}`);

if (failures.length) {
  console.error(`Angular release verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Angular release verification passed: partial-Ivy packages, ${baselineTypes.length} baseline types, ${docs.length} docs, and zoneless playground.`);
