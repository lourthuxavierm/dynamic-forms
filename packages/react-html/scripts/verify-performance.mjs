import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Bundle-size budgets for the published entry points. An entry's cost is its
// file plus every chunk it statically imports (tsup splits shared code into
// `chunk-*.js`); dynamic `import()` targets used by the lazy registry are
// excluded because they load on demand. Render cost is enforced separately by
// deterministic render-count tests (see v1-hardening.test.tsx).
const dist = new URL('../dist/', import.meta.url);
const budgets = { core: 10 * 1024, text: 2 * 1024 };
const entries = ['core', 'text', 'baseline', 'composites', 'specialized', 'temporal', 'media', 'index'];

function staticClosure(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  const source = readFileSync(new URL(file, dist), 'utf8');
  for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*)["'](\.\/[^"']+\.js)["']/g)) staticClosure(match[1].slice(2), seen);
  return seen;
}

const report = {};
for (const entry of entries) {
  const files = [...staticClosure(`${entry}.js`)];
  report[entry] = { gzipBytes: gzipSync(Buffer.concat(files.map((file) => readFileSync(new URL(file, dist))))).byteLength, files: files.length };
}
report['styles.css'] = { gzipBytes: gzipSync(readFileSync(new URL('styles.css', dist))).byteLength, files: 1 };

const failures = Object.entries(budgets)
  .filter(([entry, budget]) => report[entry].gzipBytes >= budget)
  .map(([entry, budget]) => `${entry} entry is ${report[entry].gzipBytes} bytes gzip including imported chunks; budget is < ${budget}.`);
console.log(JSON.stringify({ budgets, entries: report }, null, 2));
if (failures.length) throw new Error(failures.join('\n'));
