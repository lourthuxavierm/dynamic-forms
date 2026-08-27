import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const generated = resolve(docsRoot, 'api', 'generated');
const failures = [];
const manifestPath = resolve(generated, 'manifest.json');
if (!existsSync(manifestPath)) failures.push('generated API manifest is missing');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { packages: {} };
for (const [name, pkg] of Object.entries(manifest.packages)) {
  const slug = name.replace('@dynamic-forms/', '');
  const page = resolve(generated, `${slug}.md`);
  if (!existsSync(page)) { failures.push(`${name}: generated page is missing`); continue; }
  const markdown = readFileSync(page, 'utf8');
  for (const symbol of pkg.exports) if (!markdown.includes(`### ${symbol.name}\n`)) failures.push(`${name}.${symbol.name}: undocumented public export`);
  for (const heading of markdown.matchAll(/^### (.+)$/gm)) if (!pkg.exports.some((symbol) => symbol.name === heading[1])) failures.push(`${name}.${heading[1]}: documentation has no public export`);
}
if (failures.length) { console.error(`API reference verification failed:\n${failures.map((item) => `- ${item}`).join('\n')}`); process.exit(1); }
console.log(`API reference verification passed for ${Object.keys(manifest.packages).length} packages.`);
