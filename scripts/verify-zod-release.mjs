import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verificationRoot = mkdtempSync(join(tmpdir(), 'dynamic-forms-zod-release-'));
const pnpmCli = process.env.npm_execpath;
const publicFactories = ['createZodFieldValidator', 'createZodFormValidator'];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: workspaceRoot, encoding: 'utf8', ...options });
  if (result.status !== 0) {
    throw new Error([result.error?.message, result.stdout, result.stderr].filter(Boolean).join('\n'));
  }
  return result.stdout;
}

function runPnpm(args) {
  assert.ok(pnpmCli, 'Run this verifier through pnpm so npm_execpath is available');
  return run(process.execPath, [pnpmCli, ...args]);
}

function verifyPublishedFiles(files) {
  const paths = files.map((file) => file.path);
  for (const path of [
    'dist/index.js', 'dist/index.mjs', 'dist/index.d.ts',
    'README.md', 'RELEASE.md', 'package.json',
  ]) assert.ok(paths.includes(path), `Packed Zod adapter is missing ${path}`);

  for (const path of paths) {
    assert.ok(!path.startsWith('src/'), `Packed Zod adapter unexpectedly publishes source: ${path}`);
    assert.ok(!path.startsWith('scripts/'), `Packed Zod adapter unexpectedly publishes scripts: ${path}`);
    assert.ok(!/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path), `Packed Zod adapter unexpectedly publishes a test: ${path}`);
  }
}

try {
  runPnpm(['check:boundaries']);
  runPnpm(['--filter', '@dynamic-form-engine/zod...', 'build']);
  runPnpm(['--filter', '@dynamic-form-engine/zod', 'typecheck']);
  runPnpm(['--filter', '@dynamic-form-engine/zod', 'test']);
  runPnpm(['docs:api:check']);
  runPnpm(['verify:zod-architecture']);

  const esm = run(process.execPath, ['--input-type=module', '--eval',
    `import('./packages/zod/dist/index.mjs').then((api) => console.log(Object.keys(api).sort().join(',')))`,
  ]);
  const cjs = run(process.execPath, ['--eval',
    `console.log(Object.keys(require('./packages/zod/dist/index.js')).sort().join(','))`,
  ]);
  for (const factory of publicFactories) {
    assert.ok(esm.includes(factory), `ESM bundle is missing ${factory}`);
    assert.ok(cjs.includes(factory), `CommonJS bundle is missing ${factory}`);
  }

  const output = runPnpm([
    '--filter', '@dynamic-form-engine/zod', 'pack', '--json', '--pack-destination', verificationRoot,
  ]);
  const packed = JSON.parse(output.slice(output.indexOf('{')));
  verifyPublishedFiles(packed.files);

  run('tar', ['-xf', packed.filename, '-C', verificationRoot]);
  const manifest = JSON.parse(readFileSync(join(verificationRoot, 'package', 'package.json'), 'utf8'));
  assert.equal(manifest.name, '@dynamic-form-engine/zod');
  assert.equal(manifest.publishConfig?.access, 'public');
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.peerDependencies?.zod, '^3.25.5 || ^4.0.0');
  assert.equal(manifest.dependencies?.['@dynamic-form-engine/core'], manifest.version);
  assert.ok(!JSON.stringify(manifest).includes('workspace:'), 'Packed manifest contains an unresolved workspace protocol');
  assert.deepEqual(manifest.exports?.['.'], {
    types: './dist/index.d.ts', import: './dist/index.mjs', require: './dist/index.js',
  });

  console.log(`Zod release verified at ${manifest.version}: package, ESM/CommonJS, declarations, tests, docs/API, and publish artifact passed.`);
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
