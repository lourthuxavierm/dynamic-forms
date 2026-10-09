import { describe, expect, it } from 'vitest';
import apiReport from '../api-report.json';
import packageJson from '../package.json';
import * as reactAdapter from './index';

const report = apiReport as { exports: Record<string, { kind: string; stability: string; deprecated?: string }> };
const runtimeKinds = new Set(['class', 'function', 'const', 'enum']);

describe('@dynamic-form-engine/react public API', () => {
  it('exports the supported React adapter APIs', () => {
    expect(reactAdapter.FormProvider).toBeTypeOf('function');
    expect(reactAdapter.useFormContext).toBeTypeOf('function');
    expect(reactAdapter.useForm).toBeTypeOf('function');
    expect(reactAdapter.useField).toBeTypeOf('function');
    expect(reactAdapter.useFormStore).toBeTypeOf('function');
    expect(reactAdapter.DynamicField).toBeTypeOf('function');
  });

  it('ships exactly the runtime exports recorded in api-report.json', () => {
    const recorded = Object.entries(report.exports).filter(([, entry]) => runtimeKinds.has(entry.kind)).map(([name]) => name).sort();
    expect(Object.keys(reactAdapter).sort()).toEqual(recorded);
  });

  it('gives every deprecation a replacement and a removal target', () => {
    for (const [name, entry] of Object.entries(report.exports)) {
      if (!entry.deprecated) continue;
      expect(entry.deprecated, name).toMatch(/\buse\b/i);
      expect(entry.deprecated, name).toMatch(/removal:\s*\d+\.\d+\.\d+/i);
    }
  });

  it('declares React 18 and 19 as peer dependencies and depends only on Core', () => {
    const manifest = packageJson as { peerDependencies: Record<string, string>; dependencies: Record<string, string> };
    expect(manifest.peerDependencies).toEqual({ react: '^18.0.0 || ^19.0.0', 'react-dom': '^18.0.0 || ^19.0.0' });
    expect(Object.keys(manifest.dependencies)).toEqual(['@dynamic-form-engine/core']);
  });
});
