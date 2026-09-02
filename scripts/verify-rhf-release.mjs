import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verificationRoot = mkdtempSync(join(workspaceRoot, '.tmp-rhf-release-'));
const pnpmCli = process.env.npm_execpath;

function run(command, args) {
  const result = spawnSync(command, args, { cwd: workspaceRoot, encoding: 'utf8' });
  if (result.status !== 0) throw new Error([result.error?.message, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout;
}
function runPnpm(args) {
  assert.ok(pnpmCli, 'Run this verifier through pnpm so npm_execpath is available');
  return run(process.execPath, [pnpmCli, ...args]);
}

try {
  runPnpm(['check:boundaries']);
  runPnpm(['lint']);
  runPnpm(['--filter', '@dynamic-form-engine/rhf', 'typecheck']);
  runPnpm(['--filter', '@dynamic-form-engine/rhf', 'test']);
  runPnpm(['--filter', '@dynamic-form-engine/rhf...', 'build']);
  runPnpm(['--filter', '@dynamic-forms/rhf-playground', 'build']);
  runPnpm(['docs:verify']);

  const output = runPnpm(['--filter', '@dynamic-form-engine/rhf', 'pack', '--json', '--pack-destination', verificationRoot]);
  const packed = JSON.parse(output.slice(output.indexOf('{')));
  const paths = packed.files.map((file) => file.path);
  for (const path of ['dist/index.js', 'dist/index.mjs', 'dist/index.d.ts', 'README.md', 'RELEASE.md', 'package.json']) {
    assert.ok(paths.includes(path), `Packed RHF adapter is missing ${path}`);
  }
  for (const path of paths) {
    assert.ok(!path.startsWith('src/'), `Packed RHF adapter unexpectedly publishes source: ${path}`);
    assert.ok(!/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path), `Packed RHF adapter unexpectedly publishes a test: ${path}`);
  }

  run('tar', ['-xf', packed.filename, '-C', verificationRoot]);
  const manifest = JSON.parse(readFileSync(join(verificationRoot, 'package', 'package.json'), 'utf8'));
  assert.equal(manifest.name, '@dynamic-form-engine/rhf');
  assert.equal(manifest.publishConfig?.access, 'public');
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.peerDependencies?.react, '^18.0.0 || ^19.0.0');
  assert.equal(manifest.peerDependencies?.['react-hook-form'], '^7.52.0');
  assert.ok(!JSON.stringify(manifest).includes('workspace:'), 'Packed manifest contains an unresolved workspace protocol');

  const esm = run(process.execPath, ['--input-type=module', '--eval', "import('./packages/rhf/dist/index.mjs').then(api => console.log(Object.keys(api)))"]);
  const cjs = run(process.execPath, ['--eval', "console.log(Object.keys(require('./packages/rhf/dist/index.js')))"]);
  for (const name of ['DynamicFormRHFProvider', 'RHFForm', 'RHFField', 'createRHFResolver']) {
    assert.ok(esm.includes(name), `ESM consumer is missing ${name}`);
    assert.ok(cjs.includes(name), `CommonJS consumer is missing ${name}`);
  }
  console.log(`RHF release verified at ${manifest.version}: packed artifact, consumers, tests, builds, and docs passed.`);
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
