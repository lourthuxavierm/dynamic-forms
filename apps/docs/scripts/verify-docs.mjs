import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const playgroundRoot = resolve(docsRoot, '..', 'html-playground');
const generatedRoot = join(playgroundRoot, '.docs-snippet-check');
const excludedDirectories = new Set(['node_modules', 'dist', 'cache', '.snippet-check']);
const failures = [];
const snippets = [];
const commonMisspellings = new Map([
  ['documenation', 'documentation'],
  ['dependancy', 'dependency'],
  ['seperate', 'separate'],
  ['occured', 'occurred'],
  ['recieve', 'receive'],
  ['compatability', 'compatibility'],
]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : extname(entry.name) === '.md' ? [path] : [];
  });
}

function slug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\`*_{}[\]()#+.!?,:;'"]/g, '')
    .replace(/\s+/g, '-');
}

function headings(markdown) {
  const result = new Set();
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (match) result.add(slug(match[2]));
  }
  return result;
}

function resolveDocument(fromFile, rawTarget) {
  const target = decodeURIComponent(rawTarget.split('#')[0].split('?')[0]);
  const base = target.startsWith('/') ? join(docsRoot, target.slice(1)) : resolve(dirname(fromFile), target);
  const candidates = extname(base)
    ? [base]
    : [base, `${base}.md`, join(base, 'index.md')];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function validateLinks(file, markdown) {
  const linkPattern = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(mailto:|tel:)/.test(target)) continue;
    if (/^https?:\/\//.test(target)) {
      try {
        const url = new URL(target);
        if (url.protocol !== 'https:') failures.push(`${relative(docsRoot, file)}: external documentation links must use HTTPS: ${target}`);
      } catch {
        failures.push(`${relative(docsRoot, file)}: invalid external URL: ${target}`);
      }
      continue;
    }

    const [pathPart, anchor] = target.split('#');
    const resolved = pathPart ? resolveDocument(file, target) : file;
    if (!resolved) {
      failures.push(`${relative(docsRoot, file)}: broken local link: ${target}`);
      continue;
    }
    if (anchor && !headings(readFileSync(resolved, 'utf8')).has(anchor.toLowerCase())) {
      failures.push(`${relative(docsRoot, file)}: missing heading anchor: ${target}`);
    }
  }
}

function collectVerifiedSnippets(file, markdown) {
  const pattern = /```(ts|tsx)\s+verify\s*\r?\n([\s\S]*?)```/g;
  for (const match of markdown.matchAll(pattern)) {
    snippets.push({
      extension: match[1],
      source: `export {};\n${match[2]}`,
      origin: relative(docsRoot, file),
    });
  }
}

function validateMarkdown(file) {
  const markdown = readFileSync(file, 'utf8');
  const lines = markdown.split(/\r?\n/);
  const prose = markdown.replace(/```[\s\S]*?```/g, '');
  for (const [misspelling, correction] of commonMisspellings) {
    if (new RegExp(`\\b${misspelling}\\b`, 'i').test(prose)) {
      failures.push(`${relative(docsRoot, file)}: possible misspelling "${misspelling}"; use "${correction}"`);
    }
  }
  let previousHeading = 0;
  let h1Count = 0;
  let openFence = false;

  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) failures.push(`${relative(docsRoot, file)}:${index + 1}: trailing whitespace`);
    if (/\t/.test(line)) failures.push(`${relative(docsRoot, file)}:${index + 1}: tab character`);
    if (/^```/.test(line)) openFence = !openFence;
    const heading = /^(#{1,6})\s+/.exec(line);
    if (!heading || openFence) return;
    const level = heading[1].length;
    if (level === 1) h1Count += 1;
    if (previousHeading && level > previousHeading + 1) {
      failures.push(`${relative(docsRoot, file)}:${index + 1}: heading level jumps from H${previousHeading} to H${level}`);
    }
    previousHeading = level;
  });

  if (openFence) failures.push(`${relative(docsRoot, file)}: unclosed fenced code block`);
  if (h1Count !== 1) failures.push(`${relative(docsRoot, file)}: expected exactly one H1, found ${h1Count}`);
  validateLinks(file, markdown);
  collectVerifiedSnippets(file, markdown);
}

function verifySnippets() {
  if (!snippets.length) return;
  rmSync(generatedRoot, { recursive: true, force: true });
  mkdirSync(generatedRoot, { recursive: true });
  const paths = snippets.map((snippet, index) => {
    const path = join(generatedRoot, `snippet-${index}.${snippet.extension}`);
    writeFileSync(path, snippet.source, 'utf8');
    return path;
  });
  const typeScriptCli = resolve(docsRoot, '..', '..', 'node_modules', 'typescript', 'bin', 'tsc');
  const result = spawnSync(process.execPath, [typeScriptCli,
    '--ignoreConfig', '--noEmit', '--strict', '--skipLibCheck',
    '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'Bundler',
    '--jsx', 'react-jsx', ...paths,
  ], { cwd: playgroundRoot, encoding: 'utf8' });
  rmSync(generatedRoot, { recursive: true, force: true });
  if (result.status !== 0) failures.push(`verified snippets failed TypeScript compilation:\n${result.stdout}\n${result.stderr}`);
}

const files = walk(docsRoot);
files.forEach(validateMarkdown);
verifySnippets();

if (failures.length) {
  console.error(`Documentation verification failed with ${failures.length} issue(s):\n`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Documentation verification passed: ${files.length} Markdown files, ${snippets.length} verified TypeScript snippets.`);
