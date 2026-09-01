import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(docsRoot, '../..');
const failures = [];
const required = [
  '.github/CODEOWNERS',
  '.github/pull_request_template.md',
  '.github/workflows/docs.yml',
  'apps/docs/project/governance/index.md',
  'apps/docs/project/governance/change-impact.md',
  'apps/docs/project/governance/review-cadence.md',
  'apps/docs/project/governance/release-audit.md',
];

for (const file of required) {
  if (!existsSync(resolve(repoRoot, file))) failures.push(`${file}: missing governance artifact`);
}

const read = (file) => existsSync(resolve(repoRoot, file))
  ? readFileSync(resolve(repoRoot, file), 'utf8')
  : '';
const workflow = read('.github/workflows/docs.yml');
const template = read('.github/pull_request_template.md');
const owners = read('.github/CODEOWNERS');
const governance = required.slice(3).map(read).join('\n');

for (const expectation of [
  'docs:governance', 'DOCS_BASE_SHA',
]) {
  if (!workflow.includes(expectation)) failures.push(`documentation workflow missing: ${expectation}`);
}
for (const expectation of [
  'Public API', 'New control', 'Schema configuration', 'Breaking change',
  'Renderer difference', 'New example',
]) {
  if (!template.includes(expectation)) failures.push(`pull request template missing: ${expectation}`);
}
for (const pattern of ['/apps/docs/', '/packages/core/', '/packages/react/', '/packages/react-html/', '/packages/rhf/']) {
  if (!owners.includes(pattern)) failures.push(`CODEOWNERS missing boundary: ${pattern}`);
}
for (const expectation of ['Every pull request', 'Every release', 'Quarterly', 'Twice yearly', 'Before each major release']) {
  if (!governance.includes(expectation)) failures.push(`governance cadence missing: ${expectation}`);
}

const base = process.env.DOCS_BASE_SHA?.trim();
if (base && !/^0+$/.test(base)) {
  try {
    execFileSync('git', ['cat-file', '-e', `${base}^{commit}`], { cwd: repoRoot, stdio: 'ignore' });
    const output = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { cwd: repoRoot, encoding: 'utf8' });
    const changed = output.split(/\r?\n/).filter(Boolean).map((file) => file.replaceAll('\\', '/'));
    const has = (matcher) => changed.some(matcher);
    const requireCompanion = (label, source, companion) => {
      if (has(source) && !has(companion)) failures.push(`${label}: source changed without required documentation companion`);
    };

    requireCompanion(
      'public API',
      (file) => /^packages\/[^/]+\/(src\/index\.ts|package\.json)$/.test(file),
      (file) => /^apps\/docs\/(api|packages|integrations)\//.test(file),
    );
    requireCompanion(
      'schema configuration',
      (file) => /^packages\/core\/src\/schema\//.test(file) && !file.endsWith('.test.ts'),
      (file) => /^apps\/docs\/schema\//.test(file),
    );
    requireCompanion(
      'control or renderer',
      (file) => /^packages\/(react-html|angular-html)\/src\/(components|entries|registry|renderer)/.test(file) && !file.includes('.test.'),
      (file) => /^apps\/docs\/(controls|integrations|project\/framework-compatibility)/.test(file),
    );
    requireCompanion(
      'example',
      (file) => /^(packages\/examples\/src|apps\/[^/]*playground\/src)\//.test(file) && !file.includes('.test.'),
      (file) => /(^|\/)(tests?|[^/]+\.test|[^/]+\.spec)\.[^/]+$/.test(file) || /^apps\/docs\/tests\//.test(file),
    );

    const patch = execFileSync('git', ['diff', '--format=', '--unified=0', `${base}...HEAD`], {
      cwd: repoRoot, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024,
    });
    const breaking = /^\+.*(BREAKING CHANGE|[a-z]+(?:\([^)]*\))?!:)/im.test(patch);
    if (breaking && !has((file) => /^apps\/docs\/migration\/.*\.md$/.test(file))) {
      failures.push('breaking change: migration guidance is required');
    }

    console.log(`Documentation change-impact audit inspected ${changed.length} changed file(s) from ${base.slice(0, 12)}.`);
  } catch (error) {
    failures.push(`unable to audit DOCS_BASE_SHA ${base}: ${error.message}`);
  }
} else {
  console.log('Documentation change-impact audit skipped: DOCS_BASE_SHA is not set (structural governance still verified).');
}

if (failures.length) {
  console.error(`Documentation governance verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Documentation governance verification passed.');
