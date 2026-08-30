import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verificationRoot = mkdtempSync(join(tmpdir(), 'dynamic-forms-react-html-release-'));
const pnpmCli = process.env.npm_execpath;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    ...options,
  });
  if (result.status !== 0) {
    throw new Error([result.error?.message, result.stdout, result.stderr].filter(Boolean).join('\n'));
  }
  return result.stdout;
}

function runPnpm(args) {
  assert.ok(pnpmCli, 'Run this verifier through pnpm so npm_execpath is available');
  return run(process.execPath, [pnpmCli, ...args]);
}

function readManifest(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function pack(packageName) {
  const output = runPnpm([
    '--filter', packageName, 'pack', '--json', '--pack-destination', verificationRoot,
  ]);
  const packed = JSON.parse(output.slice(output.indexOf('{')));
  run('tar', ['-xf', packed.filename, '-C', verificationRoot]);
  const extractedPackage = join(verificationRoot, 'package');
  const manifest = readManifest(join(extractedPackage, 'package.json'));
  rmSync(extractedPackage, { recursive: true, force: true });
  return { packed, manifest };
}

function verifyFiles(label, files, required) {
  const paths = files.map((file) => file.path);
  for (const path of required) assert.ok(paths.includes(path), `${label} is missing ${path}`);
  for (const path of paths) {
    assert.ok(!path.startsWith('src/'), `${label} unexpectedly publishes source: ${path}`);
    assert.ok(!path.startsWith('scripts/'), `${label} unexpectedly publishes scripts: ${path}`);
    assert.ok(!/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path), `${label} unexpectedly publishes a test: ${path}`);
  }
}

try {
  runPnpm(['--filter', '@dynamic-form-engine/react-html...', 'build']);
  runPnpm(['--filter', '@dynamic-form-engine/html', 'build']);

  const canonical = pack('@dynamic-form-engine/react-html');
  const compatibility = pack('@dynamic-form-engine/html');

  assert.equal(canonical.manifest.name, '@dynamic-form-engine/react-html');
  assert.equal(compatibility.manifest.name, '@dynamic-form-engine/html');
  assert.equal(compatibility.manifest.version, canonical.manifest.version, 'Canonical and compatibility versions must match');
  assert.equal(compatibility.manifest.dependencies['@dynamic-form-engine/react-html'], canonical.manifest.version);
  assert.equal(canonical.manifest.publishConfig?.access, 'public');
  assert.equal(compatibility.manifest.publishConfig?.access, 'public');
  assert.ok(!JSON.stringify(canonical.manifest).includes('workspace:'), 'Canonical manifest contains an unresolved workspace protocol');
  assert.ok(!JSON.stringify(compatibility.manifest).includes('workspace:'), 'Compatibility manifest contains an unresolved workspace protocol');

  verifyFiles('react-html', canonical.packed.files, [
    'dist/index.js', 'dist/index.mjs', 'dist/index.d.ts', 'dist/styles.css',
    'docs/VERSION-1.md', 'docs/RELEASE.md', 'docs/MIGRATION-FROM-HTML.md', 'README.md', 'package.json',
  ]);
  verifyFiles('html', compatibility.packed.files, [
    'dist/index.js', 'dist/index.mjs', 'dist/index.d.ts', 'styles.css', 'README.md', 'package.json',
  ]);

  console.log(`Release packages verified at version ${canonical.manifest.version}: react-html first, html compatibility second.`);
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
