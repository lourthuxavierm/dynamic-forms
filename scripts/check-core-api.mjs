#!/usr/bin/env node
// Public API report for a published workspace package (default: core).
//
//   node scripts/check-core-api.mjs [--package react]            verify the committed report matches the source
//   node scripts/check-core-api.mjs [--package react] --update   rewrite the report after an intentional API change
//   ... --update --allow-breaking                                also accept removal of stable, non-deprecated exports
//
// The report records every public export with its stability tier and its
// declaration as the compiler sees it (comments, private members and
// implementation bodies stripped). Any difference fails the check so API
// changes are always reviewed as a diff of packages/<name>/api-report.json.
// See packages/core/STABILITY.md for the policy this enforces.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageFlag = process.argv.indexOf('--package');
const packageDirectory = packageFlag === -1 ? 'core' : process.argv[packageFlag + 1];
if (!packageDirectory || !existsSync(resolve(root, 'packages', packageDirectory, 'src/index.ts'))) {
  throw new Error(`Unknown package "${packageDirectory}". Pass --package <directory under packages/>.`);
}
const packageRoot = resolve(root, 'packages', packageDirectory);
const packageName = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8')).name;
const entry = resolve(packageRoot, 'src/index.ts');
const reportPath = resolve(packageRoot, 'api-report.json');
const update = process.argv.includes('--update');
const allowBreaking = process.argv.includes('--allow-breaking');

const program = ts.createProgram([entry], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  jsx: ts.JsxEmit.ReactJSX,
  // Resolve sibling workspace packages from source so reports do not depend on build order.
  baseUrl: root,
  paths: { '@dynamic-form-engine/core': ['packages/core/src/index.ts'], '@dynamic-form-engine/react': ['packages/react/src/index.ts'] },
});
const checker = program.getTypeChecker();
const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
const factory = ts.factory;

const source = program.getSourceFile(entry);
const moduleSymbol = source && checker.getSymbolAtLocation(source);
if (!moduleSymbol) throw new Error(`Unable to read exports of ${relative(root, entry)}`);

function tagsOf(symbol, declarations) {
  const tags = [...symbol.getJsDocTags(checker)];
  for (const declaration of declarations) for (const tag of ts.getJSDocTags(declaration)) {
    tags.push({ name: tag.tagName.text, text: [{ text: typeof tag.comment === 'string' ? tag.comment : ts.getTextOfJSDocComment(tag.comment) ?? '' }] });
  }
  return tags.map((tag) => ({ name: tag.name, text: (tag.text ?? []).map((part) => part.text).join('').trim() }));
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

const isPrivate = (member) => (ts.getCombinedModifierFlags(member) & ts.ModifierFlags.Private) !== 0
  || (member.name && ts.isPrivateIdentifier(member.name));
const hasBody = (node) => 'body' in node && node.body !== undefined;
const inferred = (node) => checker.typeToTypeNode(checker.getTypeAtLocation(node), node, ts.NodeBuilderFlags.NoTruncation);

// Overloaded functions and methods: the implementation signature is not public.
function withoutImplementations(nodes, nameOf) {
  return nodes.filter((node) => {
    if (!hasBody(node)) return true;
    const name = nameOf(node);
    return !nodes.some((other) => other !== node && !hasBody(other) && nameOf(other) === name);
  });
}

function publicClass(node) {
  const memberName = (member) => member.name?.getText?.() ?? (ts.isConstructorDeclaration(member) ? 'constructor' : '');
  // Public parameter properties (`constructor(readonly x: T)`) are part of the instance shape.
  const parameterProperties = node.members.filter(ts.isConstructorDeclaration).flatMap((constructor) => constructor.parameters)
    .filter((parameter) => ts.isParameterPropertyDeclaration(parameter, parameter.parent) && !isPrivate(parameter))
    .map((parameter) => factory.createPropertyDeclaration(parameter.modifiers, parameter.name.getText(), parameter.questionToken, parameter.type ?? inferred(parameter), undefined));
  const members = withoutImplementations(node.members.filter((member) => !isPrivate(member) && !ts.isClassStaticBlockDeclaration(member)), memberName)
    .map((member) => {
      if (ts.isMethodDeclaration(member)) return factory.updateMethodDeclaration(member, publicModifiers(member.modifiers), member.asteriskToken, member.name, member.questionToken, member.typeParameters, member.parameters.map(stripInitializer), member.type ?? inferReturn(member), undefined);
      if (ts.isConstructorDeclaration(member)) return factory.updateConstructorDeclaration(member, member.modifiers, member.parameters.map((parameter) => stripInitializer(withoutParameterModifiers(parameter))), undefined);
      if (ts.isPropertyDeclaration(member)) return factory.updatePropertyDeclaration(member, member.modifiers, member.name, member.questionToken ?? member.exclamationToken, member.type ?? inferred(member), undefined);
      if (ts.isGetAccessorDeclaration(member)) return factory.updateGetAccessorDeclaration(member, member.modifiers, member.name, member.parameters, member.type ?? inferReturn(member), undefined);
      if (ts.isSetAccessorDeclaration(member)) return factory.updateSetAccessorDeclaration(member, member.modifiers, member.name, member.parameters, undefined);
      return member;
    });
  return factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, [...parameterProperties, ...members]);
}

// `async` is an implementation detail: the declared return type is the contract.
const publicModifiers = (modifiers) => modifiers?.filter((modifier) => modifier.kind !== ts.SyntaxKind.AsyncKeyword);

function withoutParameterModifiers(parameter) {
  if (!parameter.modifiers?.length) return parameter;
  const modifiers = parameter.modifiers.filter((modifier) => !ts.isModifier(modifier) || ![ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(modifier.kind));
  return factory.updateParameterDeclaration(parameter, modifiers, parameter.dotDotDotToken, parameter.name, parameter.questionToken, parameter.type, parameter.initializer);
}

function stripInitializer(parameter) {
  if (!parameter.initializer) return parameter;
  return factory.updateParameterDeclaration(parameter, parameter.modifiers, parameter.dotDotDotToken, parameter.name, factory.createToken(ts.SyntaxKind.QuestionToken), parameter.type ?? inferred(parameter), undefined);
}

function inferReturn(node) {
  const signature = checker.getSignatureFromDeclaration(node);
  return signature ? checker.typeToTypeNode(checker.getReturnTypeOfSignature(signature), node, ts.NodeBuilderFlags.NoTruncation) : undefined;
}

function printDeclaration(node) {
  const file = node.getSourceFile();
  let printable = node;
  if (ts.isFunctionDeclaration(node)) printable = factory.updateFunctionDeclaration(node, publicModifiers(node.modifiers), node.asteriskToken, node.name, node.typeParameters, node.parameters.map(stripInitializer), node.type ?? inferReturn(node), undefined);
  else if (ts.isClassDeclaration(node)) printable = publicClass(node);
  else if (ts.isVariableDeclaration(node)) {
    return [`declare const ${node.name.getText(file)}: ${checker.typeToString(checker.getTypeAtLocation(node), node, ts.TypeFormatFlags.NoTruncation)};`];
  }
  return printer.printNode(ts.EmitHint.Unspecified, printable, file).split('\n').map((line) => line.replace(/\s+$/, '')).filter(Boolean);
}

function describe(exported) {
  const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const declarations = symbol.declarations ?? [];
  const tags = tagsOf(symbol, declarations);
  if (tags.some((tag) => tag.name === 'internal')) return undefined;
  const deprecated = tags.find((tag) => tag.name === 'deprecated');
  const kind = kindOf(symbol);
  const publicDeclarations = kind === 'function' ? withoutImplementations(declarations, () => symbol.name) : declarations;
  return {
    kind,
    stability: tags.some((tag) => tag.name === 'experimental') ? 'experimental' : 'stable',
    ...(deprecated ? { deprecated: deprecated.text || 'Deprecated.' } : {}),
    source: relative(packageRoot, declarations[0]?.getSourceFile().fileName ?? entry).replaceAll('\\', '/'),
    declaration: publicDeclarations.flatMap(printDeclaration),
  };
}

const exportsReport = {};
for (const exported of checker.getExportsOfModule(moduleSymbol).sort((a, b) => a.name.localeCompare(b.name))) {
  const described = describe(exported);
  if (described) exportsReport[exported.name] = described;
}
const version = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8')).version;
const report = {
  package: packageName,
  generatedBy: 'scripts/check-core-api.mjs',
  note: 'Generated file. Run `pnpm api:update` after an intentional public API change. See packages/core/STABILITY.md.',
  summary: {
    exports: Object.keys(exportsReport).length,
    stable: Object.values(exportsReport).filter((entry) => entry.stability === 'stable').length,
    experimental: Object.values(exportsReport).filter((entry) => entry.stability === 'experimental').length,
    deprecated: Object.values(exportsReport).filter((entry) => entry.deprecated).length,
  },
  exports: exportsReport,
};
const serialized = `${JSON.stringify(report, null, 2)}\n`;

const previous = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : undefined;
const changes = { breaking: [], changed: [], added: [], stability: [] };
if (previous) {
  for (const [name, before] of Object.entries(previous.exports)) {
    const after = exportsReport[name];
    if (!after) {
      if (before.stability === 'stable' && !before.deprecated) changes.breaking.push(`${name}: stable export removed without prior @deprecated`);
      else changes.changed.push(`${name}: removed (${before.deprecated ? 'was deprecated' : before.stability})`);
      continue;
    }
    if (before.stability !== after.stability) {
      const message = `${name}: ${before.stability} -> ${after.stability}`;
      if (before.stability === 'stable' && !before.deprecated) changes.breaking.push(`${message} (stable exports cannot be demoted)`);
      else changes.stability.push(message);
    }
    if (JSON.stringify(before.declaration) !== JSON.stringify(after.declaration) || before.kind !== after.kind) {
      changes.changed.push(`${name}: ${after.stability} declaration changed — review for backward compatibility`);
    }
    if (!before.deprecated && after.deprecated) changes.stability.push(`${name}: deprecated (${after.deprecated})`);
  }
  for (const name of Object.keys(exportsReport)) if (!previous.exports[name]) changes.added.push(`${name} (${exportsReport[name].stability} ${exportsReport[name].kind})`);
}

const printChanges = (stream) => {
  for (const [label, items] of Object.entries(changes)) {
    if (items.length) stream(`\n${label.toUpperCase()} (${items.length}):\n${items.map((item) => `  - ${item}`).join('\n')}`);
  }
};

if (update) {
  if (changes.breaking.length && !allowBreaking) {
    console.error(`Refusing to update the ${packageName} API report: breaking changes to stable exports.`);
    printChanges(console.error);
    console.error('\nDeprecate the export in a minor release first, or pass --allow-breaking for a major release.');
    process.exit(1);
  }
  writeFileSync(reportPath, serialized);
  printChanges(console.log);
  console.log(`\nWrote ${relative(root, reportPath)}: ${report.summary.exports} exports (${report.summary.stable} stable, ${report.summary.experimental} experimental, ${report.summary.deprecated} deprecated) at ${version}.`);
} else {
  if (!previous || readFileSync(reportPath, 'utf8') !== serialized) {
    console.error(previous ? `${packageName} public API differs from ${relative(root, reportPath)}.` : `${relative(root, reportPath)} is missing.`);
    printChanges(console.error);
    console.error('\nIf the change is intentional, run `pnpm api:update` and commit the report (see packages/core/STABILITY.md).');
    process.exit(1);
  }
  console.log(`${packageName} public API matches the report: ${report.summary.exports} exports (${report.summary.stable} stable, ${report.summary.experimental} experimental).`);
}
