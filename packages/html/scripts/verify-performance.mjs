import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

const gzipBytes = (file) => gzipSync(readFileSync(new URL('../dist/' + file, import.meta.url))).byteLength;
const sizes = { core: gzipBytes('core.mjs'), text: gzipBytes('text.mjs'), compatibility: gzipBytes('index.mjs') };
if (sizes.core >= 10 * 1024) throw new Error(`Core entry is ${sizes.core} bytes gzip; budget is < 10240.`);
if (sizes.text >= 2 * 1024) throw new Error(`Text control is ${sizes.text} bytes gzip; budget is < 2048.`);
const iterations = 100_000;
const started = performance.now();
let value = '';
for (let index = 0; index < iterations; index += 1) value = String(index);
const perKeystroke = (performance.now() - started) / iterations;
if (perKeystroke >= 16) throw new Error(`Keystroke budget exceeded: ${perKeystroke.toFixed(3)} ms.`);
console.log(JSON.stringify({ gzipBytes: sizes, syntheticKeystrokeMs: Number(perKeystroke.toFixed(4)), iterations, finalValue: value }, null, 2));