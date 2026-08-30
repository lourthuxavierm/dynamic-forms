import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(docsRoot, '..', '..');
const generatedRoot = resolve(docsRoot, 'api', 'generated');
const annotations = JSON.parse(readFileSync(resolve(docsRoot, 'api', 'annotations.json'), 'utf8'));
const check = process.argv.includes('--check');
const packages = [
  { slug: 'core', name: '@dynamic-form-engine/core', entry: 'packages/core/src/index.ts', maturity: 'Implemented' },
  { slug: 'react', name: '@dynamic-form-engine/react', entry: 'packages/react/src/index.ts', maturity: 'Documented' },
  { slug: 'react-html', name: '@dynamic-form-engine/react-html', entry: 'packages/react-html/src/index.ts', maturity: 'Documented' },
  { slug: 'html', name: '@dynamic-form-engine/html', entry: 'packages/html/src/index.ts', maturity: 'Compatibility-only' },
  { slug: 'zod', name: '@dynamic-form-engine/zod', entry: 'packages/zod/src/index.ts', maturity: 'Release-ready' },
];

const entries = packages.map((pkg) => resolve(root, pkg.entry));
const program = ts.createProgram(entries, {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
  skipLibCheck: true, allowJs: false,
});
const checker = program.getTypeChecker();
const failures = [];
const manifest = { generatedBy: 'apps/docs/scripts/generate-api-reference.mjs', packages: {} };

function docs(symbol) {
  return ts.displayPartsToString(symbol.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim();
}
function tags(symbol) {
  return symbol.getJsDocTags(checker).map((tag) => ({ name: tag.name, text: tag.text?.map((part) => part.text).join('').trim() ?? '' }));
}
function isInternal(symbol) {
  return tags(symbol).some((tag) => tag.name === 'internal') || symbol.name.startsWith('__');
}
function kindOf(symbol) {
  const flags = symbol.flags;
  if (flags & ts.SymbolFlags.Class) return 'class';
  if (flags & ts.SymbolFlags.Interface) return 'interface';
  if (flags & ts.SymbolFlags.TypeAlias) return 'type';
  if (flags & ts.SymbolFlags.Enum) return 'enum';
  if (flags & ts.SymbolFlags.Function) return 'function';
  if (flags & ts.SymbolFlags.Variable) return 'const';
  return 'export';
}
function signature(symbol, location, kind) {
  const type = checker.getTypeOfSymbolAtLocation(symbol, location);
  if (kind === 'function') {
    const calls = type.getCallSignatures();
    if (calls.length) return calls.map((call) => `export declare function ${symbol.name}${checker.signatureToString(call, location, ts.TypeFormatFlags.NoTruncation).replace(/^\([^)]*\)/, (value) => value)}`).join('\n');
  }
  if (kind === 'const') return `export declare const ${symbol.name}: ${checker.typeToString(type, location, ts.TypeFormatFlags.NoTruncation)};`;
  return `export ${kind} ${symbol.name};`;
}
function deprecation(symbol) {
  const tag = tags(symbol).find((entry) => entry.name === 'deprecated');
  if (!tag) return undefined;
  const replacement = /(?:use|replacement:)\s+`?([\w.]+)`?/i.exec(tag.text)?.[1];
  const removal = /removal:\s*([^.;]+)/i.exec(tag.text)?.[1]?.trim();
  return { message: tag.text || 'Deprecated.', replacement, removal };
}
function render(pkg, symbols) {
  const note = annotations.packages[pkg.slug];
  const lines = [
    `# ${pkg.name} API`, '',
    '<!-- GENERATED FILE. Run pnpm docs:api to update. -->', '',
    `- Maturity: ${pkg.maturity}`, '- Source: TypeScript public exports', '- Internal symbols: excluded', '',
    note.summary, '',
    `Related: [guide](${note.guide}) · [controls/examples](${note.example})`, '',
    '## Public exports', '',
    `This page contains ${symbols.length} exports. Signatures are regenerated from the package entry point.`, '',
  ];
  for (const entry of symbols) {
    lines.push(`### ${entry.name}`, '', `- Kind: ${entry.kind}`, `- Source: \`${entry.source}\``);
    if (entry.deprecated) {
      lines.push('- Status: Deprecated', `- Replacement: ${entry.deprecated.replacement ? `\`${entry.deprecated.replacement}\`` : 'No replacement declared'}`, `- Removal target: ${entry.deprecated.removal ?? 'Not declared'}`);
    }
    lines.push('', entry.annotation || entry.documentation || `Public ${entry.kind} exported by ${pkg.name}.`, '', '```ts', entry.signature, '```', '');
  }
  if (!symbols.some((entry) => entry.deprecated)) lines.push('## Deprecations', '', 'No exported symbol currently carries a `@deprecated` tag. When one is added, this page displays its replacement and removal target.', '');
  return `${lines.join('\n')}\n`;
}
function persist(path, content) {
  if (check) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) failures.push(`${relative(root, path)} is stale; run pnpm docs:api`);
  } else {
    mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content, 'utf8');
  }
}

for (const pkg of packages) {
  const source = program.getSourceFile(resolve(root, pkg.entry));
  if (!source) { failures.push(`${pkg.entry}: source not found`); continue; }
  const module = checker.getSymbolAtLocation(source);
  if (!module) { failures.push(`${pkg.entry}: module symbol not found`); continue; }
  const symbols = checker.getExportsOfModule(module).map((exported) => {
    const resolved = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    return { exported, resolved };
  }).filter(({ resolved }) => !isInternal(resolved)).map(({ exported, resolved }) => {
    const declaration = resolved.valueDeclaration ?? resolved.declarations?.[0] ?? source;
    const kind = kindOf(resolved);
    return {
      name: exported.name, kind, source: relative(root, declaration.getSourceFile().fileName).replaceAll('\\', '/'),
      signature: signature(resolved, declaration, kind), documentation: docs(resolved),
      annotation: annotations.symbols[`${pkg.slug}.${exported.name}`], deprecation: deprecation(resolved),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  manifest.packages[pkg.name] = { maturity: pkg.maturity, exports: symbols.map(({ name, kind, source, deprecation: deprecated }) => ({ name, kind, source, deprecated })) };
  persist(resolve(generatedRoot, `${pkg.slug}.md`), render(pkg, symbols));
}

persist(resolve(generatedRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
if (failures.length) { console.error(`API reference drift detected:\n${failures.map((entry) => `- ${entry}`).join('\n')}`); process.exit(1); }
console.log(`${check ? 'Verified' : 'Generated'} API reference for ${packages.length} packages and ${Object.values(manifest.packages).reduce((count, pkg) => count + pkg.exports.length, 0)} public exports.`);
