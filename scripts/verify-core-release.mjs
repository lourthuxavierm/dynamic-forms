import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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
  for (const path of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'README.md', 'SCHEMA.md', 'STABILITY.md', 'PERFORMANCE.md', 'package.json']) assert.ok(paths.includes(path), `Packed Core is missing ${path}`);
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
  assert.equal(api.VERSION, manifest.version, 'Packed VERSION does not match package.json');

  // Every export in the committed API report must be reachable from the tarball.
  const report = JSON.parse(readFileSync(join(workspaceRoot, 'packages/core/api-report.json'), 'utf8'));
  const runtimeNames = Object.entries(report.exports).filter(([, entry]) => ['class', 'function', 'const', 'enum'].includes(entry.kind)).map(([name]) => name).sort();
  const typeNames = Object.entries(report.exports).filter(([, entry]) => !['class', 'function', 'const', 'enum'].includes(entry.kind)).map(([name]) => name).sort();
  assert.deepEqual(Object.keys(api).sort(), runtimeNames, 'ESM runtime exports differ from api-report.json');
  const cjsKeys = JSON.parse(run(process.execPath, ['--eval', `console.log(JSON.stringify(Object.keys(require(${JSON.stringify(join(packageRoot, 'dist', 'index.cjs'))})).sort()))`]));
  assert.deepEqual(cjsKeys, runtimeNames, 'CommonJS runtime exports differ from api-report.json');

  // A consumer project must type-check an import of every export from the packed declarations.
  const consumerRoot = join(verificationRoot, 'consumer');
  const installed = join(consumerRoot, 'node_modules', '@dynamic-form-engine', 'core');
  mkdirSync(join(consumerRoot, 'node_modules', '@dynamic-form-engine'), { recursive: true });
  renameSync(packageRoot, installed);
  const importList = (names) => names.map((name) => `  ${name},`).join('\n');
  writeFileSync(join(consumerRoot, 'consumer.mts'), `import {\n${importList(runtimeNames)}\n} from '@dynamic-form-engine/core';\nimport type {\n${importList(typeNames)}\n} from '@dynamic-form-engine/core';\n\nexport const runtimeExports = [${runtimeNames.join(', ')}] as const;\n`);
  const tsc = join(workspaceRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  writeFileSync(join(consumerRoot, 'consumer.cts'), `import { FormRuntime, FormStore, VERSION } from '@dynamic-form-engine/core';\nimport type { FormState, FormSchema } from '@dynamic-form-engine/core';\nconst schema: FormSchema = { id: 'cjs', fields: [] };\nexport const state: FormState = new FormStore().getState();\nexport const runtime = new FormRuntime(schema);\nexport const version: string = VERSION;\n`);
  // Bundler and Node ESM/CommonJS consumers. Node ESM requires fully specified relative
  // declaration imports; see scripts/fix-declaration-specifiers.mjs.
  for (const [module, moduleResolution, file] of [['esnext', 'bundler', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.cts']]) {
    run(process.execPath, [tsc, '--ignoreConfig', '--noEmit', '--strict', '--target', 'es2022', '--lib', 'es2022,dom', '--module', module, '--moduleResolution', moduleResolution, join(consumerRoot, file)]);
  }
  console.log(`Core release verified at ${manifest.version}: clean tarball, ${runtimeNames.length} runtime and ${typeNames.length} type exports match api-report.json in ESM, CommonJS, and declarations (bundler, Node ESM, and Node CommonJS consumers), tests, and compilation passed.`);
} finally { rmSync(verificationRoot, { recursive: true, force: true }); }
