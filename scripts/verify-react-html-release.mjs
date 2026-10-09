import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Verifies the packed @dynamic-form-engine/react-html (canonical) and
// @dynamic-form-engine/html (compatibility) artifacts: manifests and version
// lockstep, published files, every subpath in ESM and CommonJS, runtime exports
// against api-report.json, compatibility parity, and type resolution of every
// subpath for bundler, Node ESM, and Node CommonJS consumers.
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalRoot = join(workspaceRoot, 'packages', 'react-html');
const verificationRoot = mkdtempSync(join(tmpdir(), 'dynamic-forms-react-html-release-'));
const pnpmCli = process.env.npm_execpath;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: workspaceRoot, encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error([result.error?.message, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout;
}
function runPnpm(args) {
  assert.ok(pnpmCli, 'Run this verifier through pnpm so npm_execpath is available');
  return run(process.execPath, [pnpmCli, ...args]);
}
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

const consumerRoot = join(verificationRoot, 'consumer');
const scope = join(consumerRoot, 'node_modules', '@dynamic-form-engine');
mkdirSync(scope, { recursive: true });

function pack(packageName, directory) {
  const output = runPnpm(['--filter', packageName, 'pack', '--json', '--pack-destination', verificationRoot]);
  const packed = JSON.parse(output.slice(output.indexOf('{')));
  run('tar', ['-xf', packed.filename, '-C', verificationRoot]);
  const installed = join(scope, directory);
  renameSync(join(verificationRoot, 'package'), installed);
  return { files: packed.files.map((file) => file.path), manifest: readJson(join(installed, 'package.json')), installed };
}

function verifyFiles(label, paths, required) {
  for (const path of required) assert.ok(paths.includes(path), `${label} is missing ${path}`);
  for (const path of paths) {
    assert.ok(!path.startsWith('src/'), `${label} unexpectedly publishes source: ${path}`);
    assert.ok(!path.startsWith('scripts/'), `${label} unexpectedly publishes scripts: ${path}`);
    assert.ok(!/\.(?:test|spec)\.(?:[cm]?[jt]sx?|d\.ts(?:\.map)?)$/.test(path), `${label} unexpectedly publishes a test: ${path}`);
  }
}

/** Every file referenced by the manifest's export map exists, and each runtime subpath loads in ESM and CommonJS. */
async function verifySubpaths(label, { manifest, installed }) {
  const runtime = {};
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    const targets = typeof target === 'string' ? [target] : Object.values(target);
    for (const relative of targets) assert.ok(existsSync(join(installed, relative)), `${label} ${subpath} points to missing ${relative}`);
    if (typeof target === 'string') continue;
    const esm = await import(pathToFileURL(join(installed, target.import)).href);
    const cjs = JSON.parse(run(process.execPath, ['--eval', `console.log(JSON.stringify(Object.keys(require(${JSON.stringify(join(installed, target.require))})).sort()))`], { cwd: consumerRoot }));
    const esmKeys = Object.keys(esm).sort();
    assert.ok(esmKeys.length > 0, `${label} ${subpath} has no runtime exports`);
    assert.deepEqual(cjs, esmKeys, `${label} ${subpath} ESM and CommonJS exports differ`);
    runtime[subpath] = esmKeys;
  }
  return runtime;
}

try {
  runPnpm(['--filter', '@dynamic-form-engine/react-html...', 'build']);
  runPnpm(['--filter', '@dynamic-form-engine/html', 'build']);

  const canonical = pack('@dynamic-form-engine/react-html', 'react-html');
  const compatibility = pack('@dynamic-form-engine/html', 'html');

  assert.equal(canonical.manifest.name, '@dynamic-form-engine/react-html');
  assert.equal(compatibility.manifest.name, '@dynamic-form-engine/html');
  assert.equal(compatibility.manifest.version, canonical.manifest.version, 'Canonical and compatibility versions must match');
  assert.equal(compatibility.manifest.dependencies['@dynamic-form-engine/react-html'], canonical.manifest.version);
  assert.equal(canonical.manifest.publishConfig?.access, 'public');
  assert.equal(compatibility.manifest.publishConfig?.access, 'public');
  assert.ok(!JSON.stringify(canonical.manifest).includes('workspace:'), 'Canonical manifest contains an unresolved workspace protocol');
  assert.ok(!JSON.stringify(compatibility.manifest).includes('workspace:'), 'Compatibility manifest contains an unresolved workspace protocol');

  verifyFiles('react-html', canonical.packed.files, [
    'dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/styles.css',
    'docs/VERSION-1.md', 'docs/RELEASE.md', 'docs/MIGRATION-FROM-HTML.md', 'README.md', 'package.json',
  ]);
  verifyFiles('html', compatibility.packed.files, [
    'dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'styles.css', 'README.md', 'package.json',
  ]);

  console.log(`Release packages verified at version ${canonical.manifest.version}: ${Object.keys(canonicalRuntime).length} subpaths load in ESM and CommonJS for react-html and html with identical exports, ${runtimeNames.length} runtime and ${typeNames.length} type exports match api-report.json, and every subpath type-checks for bundler, Node ESM, and Node CommonJS consumers. Publish react-html first, html second.`);
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
