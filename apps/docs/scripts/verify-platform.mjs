import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const platformRoots = ['guides', 'integrations', 'controls', 'enterprise', 'api', 'playground', 'project'];

function walk(directory, extension) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'cache'].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, extension) : extname(entry.name) === extension ? [path] : [];
  });
}

function sourceForRoute(route) {
  const path = route.split('#')[0].replace(/^\//, '').replace(/\/$/, '');
  const candidates = [join(docsRoot, `${path}.md`), join(docsRoot, path, 'index.md')];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function verifyMetadata(file, markdown) {
  for (const label of ['Status', 'Owner', 'Last verified', 'Applies to']) {
    if (!new RegExp(`^- ${label}:\\s*\\S`, 'm').test(markdown)) {
      failures.push(`${relative(docsRoot, file)}: missing metadata field "${label}"`);
    }
  }
}

function verifyImages(file, markdown) {
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    const [, alt, rawTarget] = match;
    if (!alt.trim()) failures.push(`${relative(docsRoot, file)}: image is missing alternative text`);
    if (/^https?:\/\//.test(rawTarget)) continue;
    const target = resolve(dirname(file), decodeURIComponent(rawTarget.replace(/^<|>$/g, '').split('#')[0]));
    if (!existsSync(target)) failures.push(`${relative(docsRoot, file)}: missing image asset ${rawTarget}`);
  }
}

for (const root of platformRoots) {
  for (const file of walk(join(docsRoot, root), '.md')) {
    const markdown = readFileSync(file, 'utf8');
    verifyMetadata(file, markdown);
    verifyImages(file, markdown);
  }
}

const navigationFile = join(docsRoot, '.vitepress', 'phase1-navigation.mts');
const navigation = readFileSync(navigationFile, 'utf8');
for (const match of navigation.matchAll(/link:\s*'([^']+)'/g)) {
  if (!sourceForRoute(match[1])) failures.push(`phase1-navigation.mts: unresolved route ${match[1]}`);
}

const themeIndex = readFileSync(join(docsRoot, '.vitepress', 'theme', 'index.ts'), 'utf8');
for (const component of ['CompatibilityTable', 'DocsExample', 'FrameworkAvailability', 'FrameworkTabs', 'InstallBlock', 'MaturityBadge']) {
  if (!themeIndex.includes(`app.component('${component}'`)) failures.push(`theme/index.ts: ${component} is not registered`);
  if (!existsSync(join(docsRoot, '.vitepress', 'theme', 'components', `${component}.vue`))) failures.push(`theme/components/${component}.vue: missing component`);
}

if (!existsSync(join(docsRoot, 'project', 'platform-components.md'))) {
  failures.push('project/platform-components.md: missing component fixture page');
}

if (failures.length) {
  console.error(`Documentation platform verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

const pageCount = platformRoots.reduce((count, root) => count + walk(join(docsRoot, root), '.md').length, 0);
console.log(`Documentation platform verification passed: ${pageCount} platform pages and 6 registered components.`);
