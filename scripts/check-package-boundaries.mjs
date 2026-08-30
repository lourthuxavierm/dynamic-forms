import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const policies = {
  core: { name: '@lourthuxavierm/dynamic-forms-core', dependencies: [], imports: [] },
  react: { name: '@lourthuxavierm/dynamic-forms-react', dependencies: ['@lourthuxavierm/dynamic-forms-core'] },
  html: {
    name: '@lourthuxavierm/dynamic-forms-html',
    dependencies: ['@lourthuxavierm/dynamic-forms-core', '@lourthuxavierm/dynamic-forms-react', '@lourthuxavierm/dynamic-forms-react-html'],
    imports: ['@lourthuxavierm/dynamic-forms-react-html'],
  },
  'react-html': {
    name: '@lourthuxavierm/dynamic-forms-react-html',
    dependencies: ['@lourthuxavierm/dynamic-forms-core', '@lourthuxavierm/dynamic-forms-react'],
  },
  examples: {
    name: '@dynamic-forms/examples',
    dependencies: ['@lourthuxavierm/dynamic-forms-core'],
  },
  zod: {
    name: '@lourthuxavierm/dynamic-forms-zod',
    dependencies: ['@lourthuxavierm/dynamic-forms-core'],
  },
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
const legacyHtmlPackage = '@lourthuxavierm/dynamic-forms-html';

for (const [directory, policy] of Object.entries(policies)) {
  const packageDirectory = path.join(root, 'packages', directory);
  const manifestPath = path.join(packageDirectory, 'package.json');
  const source = await readOptional(manifestPath);
  if (source === undefined) continue;
  const manifest = JSON.parse(source);
  if (manifest.name !== policy.name) errors.push(`${path.relative(root, manifestPath)}: expected package name ${policy.name}`);
  const dependencies = { ...manifest.dependencies, ...manifest.peerDependencies, ...manifest.optionalDependencies, ...manifest.devDependencies };
  for (const dependency of Object.keys(dependencies)) {
    if (dependency.startsWith('@dynamic-forms/') && !policy.dependencies.includes(dependency)) errors.push(`${path.relative(root, manifestPath)}: forbidden dependency ${dependency}`);
  }
  const allowedImports = policy.imports ?? policy.dependencies;
  for (const file of await collect(path.join(packageDirectory, 'src'))) {
    const fileSource = await readFile(file, 'utf8');
    for (const match of fileSource.matchAll(importPattern)) {
      if (!allowedImports.includes(packageName(match[1]))) errors.push(`${path.relative(root, file)}: forbidden import ${match[1]}`);
    }
  }
}

for (const scope of ['packages', 'apps']) {
  const scopeDirectory = path.join(root, scope);
  for (const entry of await readdir(scopeDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || (scope === 'packages' && entry.name === 'html')) continue;
    const workspaceDirectory = path.join(scopeDirectory, entry.name);
    const manifestPath = path.join(workspaceDirectory, 'package.json');
    const manifestSource = await readOptional(manifestPath);
    if (manifestSource !== undefined) {
      const manifest = JSON.parse(manifestSource);
      const dependencies = { ...manifest.dependencies, ...manifest.peerDependencies, ...manifest.optionalDependencies, ...manifest.devDependencies };
      if (legacyHtmlPackage in dependencies) errors.push(`${path.relative(root, manifestPath)}: new consumers must use @lourthuxavierm/dynamic-forms-react-html instead of ${legacyHtmlPackage}`);
    }
    for (const file of await collect(path.join(workspaceDirectory, 'src'))) {
      const fileSource = await readFile(file, 'utf8');
      for (const match of fileSource.matchAll(importPattern)) {
        if (packageName(match[1]) === legacyHtmlPackage) errors.push(`${path.relative(root, file)}: new consumers must import @lourthuxavierm/dynamic-forms-react-html instead of ${match[1]}`);
      }
    }
  }
}
for (const application of ['react-html-playground']) {
  const sourceRoot = path.join(root, 'apps', application, 'src');
  for (const file of await collect(sourceRoot)) {
    const source = (await readFile(file, 'utf8')).replaceAll('\\', '/');
    if (/(?:from\s*|import\s*\(\s*)['"][^'"]*apps\/(?:playground|html-playground|react-html-playground)\//.test(source)) {
      errors.push(path.relative(root, file) + ': applications must not import another application internal source files');
    }
  }
}

if (errors.length) {
  console.error('Package boundary violations:\n');
  for (const error of errors) console.error('- ' + error);
  process.exitCode = 1;
} else console.log('Package boundaries are valid.');
