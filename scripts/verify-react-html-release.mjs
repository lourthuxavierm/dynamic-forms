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
  for (const { manifest } of [canonical, compatibility]) {
    assert.ok(!JSON.stringify(manifest).includes('workspace:'), `${manifest.name} manifest contains an unresolved workspace protocol`);
  }
  assert.deepEqual(Object.keys(compatibility.manifest.exports).sort(), Object.keys(canonical.manifest.exports).sort(), 'Export subpaths must be identical');

  const entryFiles = ['index', 'core', 'baseline', 'text', 'composites', 'specialized', 'temporal', 'media'];
  const entryDeclarations = ['dist/index.d.ts', ...entryFiles.slice(1).map((entry) => `dist/entries/${entry}.d.ts`)];
  verifyFiles('react-html', canonical.files, [
    ...entryFiles.flatMap((entry) => [`dist/${entry}.js`, `dist/${entry}.cjs`]), ...entryDeclarations, 'dist/styles.css',
    'docs/VERSION-1.md', 'docs/RELEASE.md', 'docs/MIGRATION-FROM-HTML.md', 'README.md', 'package.json',
  ]);
  verifyFiles('html', compatibility.files, [
    ...entryFiles.flatMap((entry) => [`dist/${entry}.js`, `dist/${entry}.cjs`]), ...entryDeclarations, 'styles.css', 'README.md', 'package.json',
  ]);

  // Peers for the consumer project: built Core and React adapter, plus the workspace React install.
  symlinkSync(join(workspaceRoot, 'packages', 'core'), join(scope, 'core'), 'dir');
  symlinkSync(join(workspaceRoot, 'packages', 'react'), join(scope, 'react'), 'dir');
  for (const name of ['react', 'react-dom']) symlinkSync(join(canonicalRoot, 'node_modules', name), join(consumerRoot, 'node_modules', name), 'dir');
  mkdirSync(join(consumerRoot, 'node_modules', '@types'), { recursive: true });
  for (const name of ['react', 'react-dom']) symlinkSync(join(canonicalRoot, 'node_modules', '@types', name), join(consumerRoot, 'node_modules', '@types', name), 'dir');

  const canonicalRuntime = await verifySubpaths('react-html', canonical);
  const compatibilityRuntime = await verifySubpaths('html', compatibility);
  assert.deepEqual(compatibilityRuntime, canonicalRuntime, 'Compatibility runtime exports must match the canonical renderer for every subpath');

  const report = readJson(join(canonicalRoot, 'api-report.json'));
  const isRuntime = (entry) => ['class', 'function', 'const', 'enum'].includes(entry.kind);
  const runtimeNames = Object.entries(report.exports).filter(([, entry]) => isRuntime(entry)).map(([name]) => name).sort();
  const typeNames = Object.entries(report.exports).filter(([, entry]) => !isRuntime(entry)).map(([name]) => name).sort();
  assert.deepEqual(canonicalRuntime['.'], runtimeNames, 'react-html index runtime exports differ from api-report.json');
  for (const [subpath, names] of Object.entries(canonicalRuntime)) {
    for (const name of names) assert.ok(runtimeNames.includes(name), `react-html ${subpath} exports ${name}, which the index does not`);
  }

  const subpaths = Object.keys(canonicalRuntime).filter((subpath) => subpath !== '.').map((subpath) => subpath.slice(1));
  const list = (names) => names.map((name) => `  ${name},`).join('\n');
  const namespaceImports = (pkg) => subpaths.map((subpath, index) => `import * as ${pkg.replace('-', '_')}${index} from '@dynamic-form-engine/${pkg}${subpath}';`).join('\n');
  const namespaceUse = (pkg) => `export const ${pkg.replace('-', '_')}Subpaths = [${subpaths.map((_, index) => `${pkg.replace('-', '_')}${index}`).join(', ')}];`;
  writeFileSync(join(consumerRoot, 'consumer.mts'), [
    `import {\n${list(runtimeNames)}\n} from '@dynamic-form-engine/react-html';`,
    `import type {\n${list(typeNames)}\n} from '@dynamic-form-engine/react-html';`,
    `import { HtmlForm as CompatibilityForm } from '@dynamic-form-engine/html';`,
    namespaceImports('react-html'), namespaceImports('html'),
    `export const runtimeExports = [${runtimeNames.join(', ')}] as const;`,
    namespaceUse('react-html'), namespaceUse('html'),
    `export const sameForm: typeof HtmlForm = CompatibilityForm;`,
  ].join('\n'));
  writeFileSync(join(consumerRoot, 'consumer.cts'), [
    `import { HtmlForm, createDefaultHtmlRegistry } from '@dynamic-form-engine/react-html';`,
    `import { HtmlTextField } from '@dynamic-form-engine/react-html/controls/text';`,
    `import type { HtmlFormProps } from '@dynamic-form-engine/html';`,
    `export const form: typeof HtmlForm = HtmlForm;`,
    `export const registry = createDefaultHtmlRegistry();`,
    `export const text = HtmlTextField;`,
    `export type Props = HtmlFormProps;`,
  ].join('\n'));
  const tsc = join(workspaceRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  for (const [module, moduleResolution, file] of [['esnext', 'bundler', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.mts'], ['nodenext', 'nodenext', 'consumer.cts']]) {
    run(process.execPath, [tsc, '--ignoreConfig', '--noEmit', '--strict', '--target', 'es2022', '--lib', 'es2022,dom', '--jsx', 'react-jsx', '--module', module, '--moduleResolution', moduleResolution, join(consumerRoot, file)], { cwd: consumerRoot });
  }

  console.log(`Release packages verified at version ${canonical.manifest.version}: ${Object.keys(canonicalRuntime).length} subpaths load in ESM and CommonJS for react-html and html with identical exports, ${runtimeNames.length} runtime and ${typeNames.length} type exports match api-report.json, and every subpath type-checks for bundler, Node ESM, and Node CommonJS consumers. Publish react-html first, html second.`);
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
