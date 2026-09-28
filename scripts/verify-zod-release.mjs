import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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
    'dist/index.js', 'dist/index.cjs', 'dist/index.d.ts',
    'README.md', 'RELEASE.md', 'package.json',
  ]) assert.ok(paths.includes(path), `Packed Zod adapter is missing ${path}`);

  for (const path of paths) {
    assert.ok(!path.startsWith('src/'), `Packed Zod adapter unexpectedly publishes source: ${path}`);
    assert.ok(!path.startsWith('scripts/'), `Packed Zod adapter unexpectedly publishes scripts: ${path}`);
    assert.ok(!/\.(?:test|spec)\.(?:[cm]?[jt]sx?|d\.ts(?:\.map)?)$/.test(path), `Packed Zod adapter unexpectedly publishes a test: ${path}`);
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
    `import('./packages/zod/dist/index.js').then((api) => console.log(Object.keys(api).sort().join(',')))`,
  ]);
  const cjs = run(process.execPath, ['--eval',
    `console.log(Object.keys(require('./packages/zod/dist/index.cjs')).sort().join(','))`,
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
    types: './dist/index.d.ts', import: './dist/index.js', require: './dist/index.cjs',
  });

  // Runtime exports of the packed bundles must match the committed API report.
  const packageRoot = join(verificationRoot, 'package');
  const report = JSON.parse(readFileSync(join(workspaceRoot, 'packages/zod/api-report.json'), 'utf8'));
  const isRuntime = (entry) => ['class', 'function', 'const', 'enum'].includes(entry.kind);
  const runtimeNames = Object.entries(report.exports).filter(([, entry]) => isRuntime(entry)).map(([name]) => name).sort();
  const typeNames = Object.entries(report.exports).filter(([, entry]) => !isRuntime(entry)).map(([name]) => name).sort();
  const packedEsm = run(process.execPath, ['--input-type=module', '--eval', `import(${JSON.stringify('file://' + join(packageRoot, 'dist/index.js'))}).then((api) => console.log(JSON.stringify(Object.keys(api).sort())))`]);
  const packedCjs = run(process.execPath, ['--eval', `console.log(JSON.stringify(Object.keys(require(${JSON.stringify(join(packageRoot, 'dist/index.cjs'))})).sort()))`]);
  assert.deepEqual(JSON.parse(packedEsm), runtimeNames, 'Packed ESM exports differ from api-report.json');
  assert.deepEqual(JSON.parse(packedCjs), runtimeNames, 'Packed CommonJS exports differ from api-report.json');

  // A consumer passes real Zod schemas to both factories under each module resolution mode.
  const consumerRoot = join(verificationRoot, 'consumer');
  const scope = join(consumerRoot, 'node_modules', '@dynamic-form-engine');
  mkdirSync(scope, { recursive: true });
  renameSync(packageRoot, join(scope, 'zod'));
  symlinkSync(join(workspaceRoot, 'packages', 'core'), join(scope, 'core'), 'dir');
  symlinkSync(join(workspaceRoot, 'packages', 'zod', 'node_modules', 'zod'), join(consumerRoot, 'node_modules', 'zod'), 'dir');
  const usage = [
    `const schema = z.object({ email: z.string().email(), contacts: z.array(z.object({ email: z.string().email() })) });`,
    `type Values = { email: string; contacts: Array<{ email: string }> };`,
    `export const form: FormValidator<Values> = createZodFormValidator<Values>(schema, { errorMode: 'all' });`,
    `export const field = createZodFieldValidator(z.string().min(2));`,
    `export const errors = zodIssuesToFormErrors([{ path: ['contacts', 0, 'email'], message: 'x' }]);`,
  ].join('\n');
  writeFileSync(join(consumerRoot, 'consumer.mts'), [
    `import {\n${runtimeNames.map((name) => `  ${name},`).join('\n')}\n} from '@dynamic-form-engine/zod';`,
    `import type {\n${typeNames.map((name) => `  ${name},`).join('\n')}\n} from '@dynamic-form-engine/zod';`,
    `import type { FormValidator } from '@dynamic-form-engine/core';`,
    `import { z } from 'zod';`, usage,
    `export const all = [${runtimeNames.join(', ')}];`,
  ].join('\n'));
  writeFileSync(join(consumerRoot, 'consumer.cts'), [
    `import { createZodFieldValidator, createZodFormValidator, zodIssuesToFormErrors } from '@dynamic-form-engine/zod';`,
    `import type { FormValidator } from '@dynamic-form-engine/core';`,
    `import { z } from 'zod';`, usage,
  ].join('\n'));
  const tsc = join(workspaceRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  for (const [module, moduleResolution, file] of [['esnext', 'bundler', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.cts']]) {
    run(process.execPath, [tsc, '--ignoreConfig', '--noEmit', '--strict', '--skipLibCheck', '--target', 'es2022', '--lib', 'es2022,dom', '--module', module, '--moduleResolution', moduleResolution, join(consumerRoot, file)], { cwd: consumerRoot });
  }

  console.log(`Zod release verified at ${manifest.version}: package, ESM/CommonJS exports matching api-report.json, declarations for bundler, Node ESM, and Node CommonJS consumers using real Zod schemas, tests, docs/API, and publish artifact passed.`);
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
