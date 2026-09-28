import { describe, expect, it } from 'vitest';
import apiReport from '../api-report.json';
import packageJson from '../package.json';
import * as reactHtml from './index';
import { HTML_ADAPTER_VERSION as coreEntryVersion } from './entries/core';
import { HTML_ADAPTER_VERSION, HTML_TOKEN_PREFIX } from './index';

const report = apiReport as { exports: Record<string, { kind: string; deprecated?: string }> };
const runtimeKinds = new Set(['class', 'function', 'const', 'enum']);

describe('@dynamic-form-engine/react-html public API', () => {
  it('exposes stable metadata without design-system runtime dependencies', () => {
    expect(HTML_ADAPTER_VERSION).toBe(packageJson.version);
    expect(coreEntryVersion).toBe(HTML_ADAPTER_VERSION);
    expect(HTML_TOKEN_PREFIX).toBe('--df-');
  });

  it('ships exactly the runtime exports recorded in api-report.json', () => {
    const recorded = Object.entries(report.exports).filter(([, entry]) => runtimeKinds.has(entry.kind)).map(([name]) => name).sort();
    expect(Object.keys(reactHtml).sort()).toEqual(recorded);
  });

  it('gives every deprecation a replacement and a removal target', () => {
    for (const [name, entry] of Object.entries(report.exports)) {
      if (!entry.deprecated) continue;
      expect(entry.deprecated, name).toMatch(/\buse\b/i);
      expect(entry.deprecated, name).toMatch(/removal:\s*\d+\.\d+\.\d+/i);
    }
  });
});
