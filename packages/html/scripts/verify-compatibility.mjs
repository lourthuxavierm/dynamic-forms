import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalRoot = resolve(packageRoot, '..', 'react-html');
const compatibilityManifest = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
const canonicalManifest = JSON.parse(readFileSync(resolve(canonicalRoot, 'package.json'), 'utf8'));
const require = createRequire(import.meta.url);

const compatibilityExports = Object.keys(compatibilityManifest.exports).sort();
const canonicalExports = Object.keys(canonicalManifest.exports).sort();
assert.deepEqual(compatibilityExports, canonicalExports, 'Public export subpaths must remain identical');

const runtimeSubpaths = compatibilityExports.filter((subpath) => subpath !== './styles.css');
for (const subpath of runtimeSubpaths) {
  const suffix = subpath === '.' ? '' : subpath.slice(1);
  const compatibilitySpecifier = `@dynamic-form-engine/html${suffix}`;
  const canonicalSpecifier = `@dynamic-form-engine/react-html${suffix}`;

  const compatibilityEsm = await import(compatibilitySpecifier);
  const canonicalEsm = await import(canonicalSpecifier);
  assert.deepEqual(Object.keys(compatibilityEsm).sort(), Object.keys(canonicalEsm).sort(), `${subpath} ESM exports differ`);
  for (const exportName of Object.keys(canonicalEsm)) {
    assert.equal(compatibilityEsm[exportName], canonicalEsm[exportName], `${subpath} ESM export ${exportName} is wrapped or replaced`);
  }

  const compatibilityCjs = require(compatibilitySpecifier);
  const canonicalCjs = require(canonicalSpecifier);
  assert.deepEqual(Object.keys(compatibilityCjs).sort(), Object.keys(canonicalCjs).sort(), `${subpath} CommonJS exports differ`);
  for (const exportName of Object.keys(canonicalCjs)) {
    assert.equal(compatibilityCjs[exportName], canonicalCjs[exportName], `${subpath} CommonJS export ${exportName} is wrapped or replaced`);
  }
}

for (const [subpath, target] of Object.entries(compatibilityManifest.exports)) {
  const targets = typeof target === 'string' ? [target] : Object.values(target);
  for (const relativeTarget of targets) {
    assert.ok(existsSync(resolve(packageRoot, relativeTarget)), `${subpath} target is missing: ${relativeTarget}`);
  }
}

const stylesheet = readFileSync(resolve(packageRoot, 'styles.css'), 'utf8').trim();
assert.equal(stylesheet, "@import '@dynamic-form-engine/react-html/styles.css';");

console.log(`Compatibility verified: ${runtimeSubpaths.length} runtime entries in ESM and CommonJS, plus stylesheet.`);
