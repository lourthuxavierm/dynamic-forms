import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Verifies the packed @dynamic-form-engine/react artifact: contents, ESM and
// CommonJS runtime exports against api-report.json, and type resolution for
// bundler, Node ESM, and Node CommonJS consumers.
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reactRoot = join(workspaceRoot, 'packages', 'react');
const verificationRoot = mkdtempSync(join(tmpdir(), 'dynamic-forms-react-release-'));
const pnpmCli = process.env.npm_execpath;
function run(command, args, cwd = workspaceRoot) { const result = spawnSync(command, args, { cwd, encoding: 'utf8' }); if (result.status !== 0) throw new Error([result.error?.message, result.stdout, result.stderr].filter(Boolean).join('\n')); return result.stdout; }
function runPnpm(args) { assert.ok(pnpmCli, 'Run through pnpm so npm_execpath is available'); return run(process.execPath, [pnpmCli, ...args]); }

try {
  runPnpm(['--filter', '@dynamic-form-engine/react...', 'build']);
  runPnpm(['--filter', '@dynamic-form-engine/react', 'typecheck']);
  runPnpm(['--filter', '@dynamic-form-engine/react', 'test']);
  const output = runPnpm(['--filter', '@dynamic-form-engine/react', 'pack', '--json', '--pack-destination', verificationRoot]);
  const packed = JSON.parse(output.slice(output.indexOf('{')));
  const paths = packed.files.map((file) => file.path);
  for (const path of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'README.md', 'package.json']) assert.ok(paths.includes(path), `Packed React adapter is missing ${path}`);
  for (const path of paths) {
    assert.ok(!path.startsWith('src/'), `Packed React adapter publishes source: ${path}`);
    assert.ok(!/\.(?:test|spec)\.d\.ts(?:\.map)?$/.test(path), `Packed React adapter publishes test declarations: ${path}`);
  }
  run('tar', ['-xf', packed.filename, '-C', verificationRoot]);

  const consumerRoot = join(verificationRoot, 'consumer');
  const scope = join(consumerRoot, 'node_modules', '@dynamic-form-engine');
  mkdirSync(scope, { recursive: true });
  renameSync(join(verificationRoot, 'package'), join(scope, 'react'));
  const installed = join(scope, 'react');
  const manifest = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
  assert.equal(manifest.name, '@dynamic-form-engine/react');
  assert.equal(manifest.sideEffects, false);
  assert.ok(!JSON.stringify(manifest).includes('workspace:'), 'Packed manifest contains an unresolved workspace protocol');
  assert.deepEqual(Object.keys(manifest.dependencies), ['@dynamic-form-engine/core']);

  // Peer and sibling packages for the consumer: built Core and the workspace React installation.
  symlinkSync(join(workspaceRoot, 'packages', 'core'), join(scope, 'core'), 'dir');
  for (const name of ['react', 'react-dom']) symlinkSync(join(reactRoot, 'node_modules', name), join(consumerRoot, 'node_modules', name), 'dir');
  mkdirSync(join(consumerRoot, 'node_modules', '@types'), { recursive: true });
  for (const name of ['react', 'react-dom']) symlinkSync(join(reactRoot, 'node_modules', '@types', name), join(consumerRoot, 'node_modules', '@types', name), 'dir');

  const report = JSON.parse(readFileSync(join(reactRoot, 'api-report.json'), 'utf8'));
  const isRuntime = (entry) => ['class', 'function', 'const', 'enum'].includes(entry.kind);
  const runtimeNames = Object.entries(report.exports).filter(([, entry]) => isRuntime(entry)).map(([name]) => name).sort();
  const typeNames = Object.entries(report.exports).filter(([, entry]) => !isRuntime(entry)).map(([name]) => name).sort();

  const esm = await import(pathToFileURL(join(installed, 'dist', 'index.js')).href);
  assert.deepEqual(Object.keys(esm).sort(), runtimeNames, 'ESM runtime exports differ from api-report.json');
  const cjsKeys = JSON.parse(run(process.execPath, ['--eval', `console.log(JSON.stringify(Object.keys(require(${JSON.stringify(join(installed, 'dist', 'index.cjs'))})).sort()))`], consumerRoot));
  assert.deepEqual(cjsKeys, runtimeNames, 'CommonJS runtime exports differ from api-report.json');

  const importList = (names) => names.map((name) => `  ${name},`).join('\n');
  writeFileSync(join(consumerRoot, 'consumer.mts'), `import {\n${importList(runtimeNames)}\n} from '@dynamic-form-engine/react';\nimport type {\n${importList(typeNames)}\n} from '@dynamic-form-engine/react';\nexport const runtimeExports = [${runtimeNames.join(', ')}] as const;\n`);
  writeFileSync(join(consumerRoot, 'consumer.cts'), `import { FormProvider, useField } from '@dynamic-form-engine/react';\nimport type { FieldComponentProps, FormProviderProps } from '@dynamic-form-engine/react';\nexport const provider: typeof FormProvider = FormProvider;\nexport const hook: typeof useField = useField;\nexport type Props = FieldComponentProps<string> & Partial<FormProviderProps>;\n`);
  const tsc = join(workspaceRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  for (const [module, moduleResolution, file] of [['esnext', 'bundler', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.cts']]) {
    run(process.execPath, [tsc, '--ignoreConfig', '--noEmit', '--strict', '--target', 'es2022', '--lib', 'es2022,dom', '--jsx', 'react-jsx', '--module', module, '--moduleResolution', moduleResolution, join(consumerRoot, file)], consumerRoot);
  }
  console.log(`React release verified at ${manifest.version}: clean tarball, ${runtimeNames.length} runtime and ${typeNames.length} type exports match api-report.json in ESM, CommonJS, and declarations (bundler, Node ESM, and Node CommonJS consumers), tests, and builds passed.`);
} finally { rmSync(verificationRoot, { recursive: true, force: true }); }
