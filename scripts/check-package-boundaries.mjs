import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const policies = {
  core: { name: '@dynamic-forms/core', allowed: [] },
  react: { name: '@dynamic-forms/react', allowed: ['@dynamic-forms/core'] },
  html: { name: '@dynamic-forms/html', allowed: ['@dynamic-forms/core', '@dynamic-forms/react'], forbidden: ['@dynamic-forms/mui', '@emotion/react', '@emotion/styled', '@mui/material'] },
  mui: { name: '@dynamic-forms/mui', allowed: ['@dynamic-forms/core', '@dynamic-forms/react'], forbidden: ['@dynamic-forms/html'] },
};
const extensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const importPattern = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)['"](@dynamic-forms\/[^'"]+)['"]/g;
const errors = [];

async function readOptional(file) {
  try { return await readFile(file, 'utf8'); }
  catch (error) { if (error?.code === 'ENOENT') return undefined; throw error; }
}
async function collect(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error?.code === 'ENOENT') return []; throw error; }
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(target));
    else if (extensions.has(path.extname(entry.name))) files.push(target);
  }
  return files;
}
const packageName = (specifier) => specifier.split('/').slice(0, 2).join('/');

for (const [directory, policy] of Object.entries(policies)) {
  const packageDirectory = path.join(root, 'packages', directory);
  const manifestPath = path.join(packageDirectory, 'package.json');
  const source = await readOptional(manifestPath);
  if (source === undefined) continue;
  const manifest = JSON.parse(source);
  if (manifest.name !== policy.name) errors.push(`${path.relative(root, manifestPath)}: expected package name ${policy.name}`);
  const dependencies = { ...manifest.dependencies, ...manifest.peerDependencies, ...manifest.optionalDependencies, ...manifest.devDependencies };
  for (const dependency of Object.keys(dependencies)) {
    if (dependency.startsWith('@dynamic-forms/') && !policy.allowed.includes(dependency)) errors.push(`${path.relative(root, manifestPath)}: forbidden dependency ${dependency}`);
    if (policy.forbidden?.includes(dependency)) errors.push(`${path.relative(root, manifestPath)}: forbidden dependency ${dependency}`);
  }
  for (const file of await collect(path.join(packageDirectory, 'src'))) {
    const fileSource = await readFile(file, 'utf8');
    for (const match of fileSource.matchAll(importPattern)) {
      if (!policy.allowed.includes(packageName(match[1]))) errors.push(`${path.relative(root, file)}: forbidden import ${match[1]}`);
    }
  }
}
if (errors.length) {
  console.error('Package boundary violations:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else console.log('Package boundaries are valid.');
