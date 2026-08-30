import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const failures = [];
const required = [
  'apps/docs/architecture/angular/index.md',
  'apps/docs/project/angular-compatibility.md',
  'apps/docs/project/phase-9-status.md',
  'apps/docs/project/phase-10-status.md',
  'apps/docs/integrations/angular/index.md',
  'apps/docs/integrations/angular-html/index.md',
  'docs/architecture/decisions/angular-adapter.md',
  'docs/proposals/angular-public-api.md',
  'packages/angular/package.json',
  'packages/angular-html/package.json',
];

for (const file of required) {
  if (!existsSync(resolve(root, file))) failures.push(`${file}: missing Angular deliverable`);
}

const coreBoundary = `${readFileSync(resolve(root, 'packages/core/package.json'), 'utf8')}\n${readFileSync(resolve(root, 'packages/core/src/index.ts'), 'utf8')}`;
if (/angular|rxjs|zone\.js/i.test(coreBoundary)) failures.push('Core boundary contains an Angular-specific dependency or export');

const angularPackage = JSON.parse(readFileSync(resolve(root, 'packages/angular/package.json'), 'utf8'));
const htmlPackage = JSON.parse(readFileSync(resolve(root, 'packages/angular-html/package.json'), 'utf8'));
if (angularPackage.name !== '@lourthuxavierm/dynamic-forms-angular') failures.push('Angular adapter package has the wrong name');
if (htmlPackage.name !== '@lourthuxavierm/dynamic-forms-angular-html') failures.push('Angular HTML package has the wrong name');
if (!angularPackage.peerDependencies?.['@angular/core']) failures.push('Angular adapter does not declare its Angular peer');

const phase10 = readFileSync(resolve(root, 'apps/docs/project/phase-10-status.md'), 'utf8');
for (const phrase of ['Experimental first slice implemented', 'Remaining before full Phase 10 completion']) {
  if (!phase10.includes(phrase)) failures.push(`Phase 10 status is missing: ${phrase}`);
}

if (failures.length) {
  console.error(`Angular architecture verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Angular architecture verification passed: ${required.length} implementation and documentation deliverables; Core remains framework-independent.`);
