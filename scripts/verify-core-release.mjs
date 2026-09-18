import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verificationRoot = mkdtempSync(join(tmpdir(), 'dynamic-forms-core-release-'));
const pnpmCli = process.env.npm_execpath;
function run(command, args) { const result = spawnSync(command, args, { cwd: workspaceRoot, encoding: 'utf8' }); if (result.status !== 0) throw new Error([result.error?.message, result.stdout, result.stderr].filter(Boolean).join('\n')); return result.stdout; }
function runPnpm(args) { assert.ok(pnpmCli, 'Run through pnpm so npm_execpath is available'); return run(process.execPath, [pnpmCli, ...args]); }

try {
  runPnpm(['--filter', '@dynamic-form-engine/core', 'build']);
  runPnpm(['--filter', '@dynamic-form-engine/core', 'typecheck']);
  runPnpm(['--filter', '@dynamic-form-engine/core', 'test']);
  const output = runPnpm(['--filter', '@dynamic-form-engine/core', 'pack', '--json', '--pack-destination', verificationRoot]);
  const packed = JSON.parse(output.slice(output.indexOf('{')));
  const paths = packed.files.map((file) => file.path);
  for (const path of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'README.md', 'SCHEMA.md', 'PERFORMANCE.md', 'package.json']) assert.ok(paths.includes(path), `Packed Core is missing ${path}`);
  for (const path of paths) {
    assert.ok(!path.startsWith('src/'), `Packed Core unexpectedly publishes source: ${path}`);
    assert.ok(!/(?:^|\/)type-tests\//.test(path), `Packed Core unexpectedly publishes type tests: ${path}`);
    assert.ok(!/\.(?:test|spec)\.d\.ts(?:\.map)?$/.test(path), `Packed Core unexpectedly publishes test declarations: ${path}`);
  }
  run('tar', ['-xf', packed.filename, '-C', verificationRoot]);
  const packageRoot = join(verificationRoot, 'package');
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.name, '@dynamic-form-engine/core'); assert.equal(manifest.publishConfig?.access, 'public'); assert.equal(manifest.sideEffects, false);
  assert.ok(!JSON.stringify(manifest).includes('workspace:'), 'Packed manifest contains an unresolved workspace protocol');
  const api = await import(pathToFileURL(join(packageRoot, 'dist', 'index.js')).href);
  for (const name of ['compileSchema', 'compileSchemaOrThrow', 'defineFormSchema', 'definePortableFormSchema', 'FormRuntime']) assert.equal(typeof api[name], 'function', `ESM consumer is missing ${name}`);
  const compiled = api.compileSchemaOrThrow({ schemaVersion: 1, id: 'consumer', fields: [{ name: 'title', type: 'text' }] });
  assert.equal(compiled.fieldsByPath.get('title').defaultValue, '');
  const cjsOutput = run(process.execPath, ['--eval', `const api=require(${JSON.stringify(join(packageRoot, 'dist', 'index.cjs'))}); if(typeof api.compileSchema!=='function') process.exit(1); console.log(api.CURRENT_SCHEMA_VERSION)`]);
  assert.equal(cjsOutput.trim(), '1');
  console.log(`Core release verified at ${manifest.version}: clean tarball, ESM/CommonJS consumers, declarations, tests, and compilation passed.`);
} finally { rmSync(verificationRoot, { recursive: true, force: true }); }
