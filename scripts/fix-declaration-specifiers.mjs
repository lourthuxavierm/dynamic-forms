#!/usr/bin/env node
// Rewrites extensionless relative specifiers in emitted declaration files to
// explicit `.js` paths, e.g. `export * from "./async"` -> `"./async/index.js"`.
//
// Packages with `"type": "module"` publish ESM declarations. Under
// `moduleResolution: node16/nodenext`, ESM relative imports must be fully
// specified, so extensionless re-exports make every symbol invisible to those
// consumers. Source files keep bundler-style imports; only the output changes.
//
//   node scripts/fix-declaration-specifiers.mjs <dist-directory>
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/fix-declaration-specifiers.mjs <dist-directory>');
  process.exit(1);
}
const root = resolve(target);

function* declarationFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) yield* declarationFiles(path);
    else if (/\.d\.(?:ts|mts|cts)$/.test(entry)) yield path;
  }
}

function resolveSpecifier(file, specifier) {
  if (/\.(?:[cm]?js|json)$/.test(specifier)) return specifier;
  const base = resolve(dirname(file), specifier);
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`;
  if (existsSync(join(base, 'index.d.ts'))) return `${specifier.replace(/\/$/, '')}/index.js`;
  throw new Error(`${file}: cannot resolve declaration for "${specifier}"`);
}

// Static `from '...'`, side-effect `import '...'`, and `import('...')` type queries.
const pattern = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*|\.{1,2})\2/g;
let rewritten = 0;
let files = 0;
for (const file of declarationFiles(root)) {
  const source = readFileSync(file, 'utf8');
  const next = source.replace(pattern, (match, prefix, quote, specifier) => {
    const fixed = resolveSpecifier(file, specifier);
    if (fixed !== specifier) rewritten += 1;
    return `${prefix}${quote}${fixed}${quote}`;
  });
  if (next !== source) {
    writeFileSync(file, next);
    files += 1;
  }
}
console.log(`Declaration specifiers: rewrote ${rewritten} relative specifier(s) in ${files} file(s) under ${target}.`);
