import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const failures = [];
const groups = {
  react: ['index', 'installation', 'form-provider', 'dynamic-components', 'hooks', 'validation', 'custom-controls', 'accessibility', 'ssr', 'performance', 'testing'],
  'react-html': ['index', 'installation', 'html-form', 'controls', 'custom-controls', 'layouts', 'styling', 'accessibility', 'ssr', 'performance', 'testing', 'deep-references'],
};
const documents = new Map();

for (const [group, pages] of Object.entries(groups)) {
  for (const page of pages) {
    const path = resolve(root, `apps/docs/integrations/${group}/${page}.md`);
    if (!existsSync(path)) {
      failures.push(`integrations/${group}/${page}.md: missing canonical page`);
      continue;
    }
    const markdown = readFileSync(path, 'utf8');
    documents.set(`${group}/${page}`, markdown);
    for (const label of ['Status', 'Owner', 'Last verified', 'Applies to']) {
      if (!new RegExp(`^- ${label}:\\s*\\S`, 'm').test(markdown)) failures.push(`${group}/${page}.md: missing ${label}`);
    }
  }
}

const reactManifest = JSON.parse(readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'));
const htmlManifest = JSON.parse(readFileSync(resolve(root, 'packages/react-html/package.json'), 'utf8'));
if (reactManifest.description !== 'React adapter for Dynamic Forms') failures.push('React package responsibility changed');
if (reactManifest.dependencies?.['@dynamic-forms/core'] !== 'workspace:*') failures.push('React must depend on Core');
if (!reactManifest.peerDependencies?.react || !reactManifest.peerDependencies?.['react-dom']) failures.push('React peer boundary is undocumented');
if (!htmlManifest.peerDependencies?.react || !htmlManifest.peerDependencies?.['react-dom']) failures.push('React HTML peer boundary is undocumented');

const reactCombined = [...documents.entries()].filter(([key]) => key.startsWith('react/')).map(([, value]) => value).join('\n');
for (const api of ['FormProvider', 'useFormContext', 'DynamicForm', 'DynamicField', 'useForm', 'useField', 'useFieldState', 'useFormState', 'useFormActions', 'useWatch', 'useDataSource', 'useFormEvent', 'useFieldArray', 'useSection', 'useWizard', 'FormErrorSummary', 'LiveRegion', 'registerReactField']) {
  if (!reactCombined.includes(`\`${api}\``)) failures.push(`React docs: missing public API ${api}`);
}

const htmlCombined = [...documents.entries()].filter(([key]) => key.startsWith('react-html/')).map(([, value]) => value).join('\n');
for (const api of ['HtmlForm', 'HtmlFieldRenderer', 'createHtmlRegistry', 'mergeHtmlRegistries', 'createDefaultHtmlRegistry', 'createLazyHtmlRegistry']) {
  if (!htmlCombined.includes(`\`${api}\``)) failures.push(`React HTML docs: missing public API ${api}`);
}
if (!htmlCombined.includes('does not call\n+`FormProvider.submit()`') && !htmlCombined.includes('does not call `FormProvider.submit()`')) failures.push('React HTML docs: missing submission boundary');

const packageDocs = readdirSync(resolve(root, 'packages/react-html/docs')).filter((file) => file.endsWith('.md')).sort();
const catalogue = documents.get('react-html/deep-references') ?? '';
for (const file of packageDocs) if (!catalogue.includes(`\`${file}\``)) failures.push(`deep-references.md: missing ${file}`);

const playground = readFileSync(resolve(root, 'apps/react-html-playground/src/App.tsx'), 'utf8');
for (const evidence of ['HtmlForm', 'FormProvider', 'All 42 stable controls', 'Submitted values']) {
  if (!playground.includes(evidence)) failures.push(`React HTML playground: missing ${evidence}`);
}

if (failures.length) {
  console.error(`React integration documentation verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`React integration documentation verification passed: ${groups.react.length} React pages, ${groups['react-html'].length} React HTML pages, and ${packageDocs.length} deep references.`);
