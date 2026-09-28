import { describe, expect, it, vi } from 'vitest';
import apiReport from '../api-report.json';
import packageJson from '../package.json';
import * as core from './index';
import type { InferSchemaType } from './schema';

interface ApiReportEntry { kind: string; stability: string; deprecated?: string; declaration: string[] }
const report = apiReport as { exports: Record<string, ApiReportEntry> };
const manifest = packageJson as { version: string };
const runtimeKinds = new Set(['class', 'function', 'const', 'enum']);

describe('public Core API regression', () => {
  it('ships exactly the runtime exports recorded in api-report.json', () => {
    const recorded = Object.entries(report.exports).filter(([, entry]) => runtimeKinds.has(entry.kind)).map(([name]) => name).sort();
    expect(Object.keys(core).sort()).toEqual(recorded);
  });

  it('classifies every export as stable or experimental', () => {
    for (const [name, entry] of Object.entries(report.exports)) {
      expect(['stable', 'experimental'], name).toContain(entry.stability);
      expect(entry.declaration.length, name).toBeGreaterThan(0);
    }
  });

  it('gives every deprecation a replacement and a removal target', () => {
    for (const [name, entry] of Object.entries(report.exports)) {
      if (!entry.deprecated) continue;
      expect(entry.deprecated, name).toMatch(/\buse\b/i);
      expect(entry.deprecated, name).toMatch(/removal:\s*\d+\.\d+\.\d+/i);
    }
  });

  it('reports the package version at runtime', () => {
    expect(core.VERSION).toBe(manifest.version);
  });

  it('keeps the runtime lifecycle phase order stable', () => {
    expect(core.RUNTIME_LIFECYCLE_PHASES).toEqual(['mutation', 'dependencies', 'conditions', 'events', 'notification', 'dataSource', 'validation']);
  });
});

describe('public Core API', () => {
  it('exports the stable public modules', () => {
    expect(core.FormStore).toBeTypeOf('function');
    expect(core.validateSchema).toBeTypeOf('function');
    expect(core.createFormValidator).toBeTypeOf('function');
    expect(core.ConditionController).toBeTypeOf('function');
    expect(core.DependencyController).toBeTypeOf('function');
    expect(core.DataSourceManager).toBeTypeOf('function');
  });

  it('preserves type inference for readonly schema declarations', () => {
    const schema = {
      id: 'inference',
      fields: [{ name: 'enabled', type: 'switch' }, { name: 'count', type: 'number' }],
    } as const;
    type Values = InferSchemaType<typeof schema>;
    const values: Values = { enabled: true, count: 2 };
    expect(values).toEqual({ enabled: true, count: 2 });
  });

  it('supports unsubscribe for global and field listeners', () => {
    const store = new core.FormStore({ name: '' });
    const global = vi.fn();
    const field = vi.fn();
    const unsubscribeGlobal = store.subscribe(global);
    const unsubscribeField = store.subscribeToField('name', field);
    unsubscribeGlobal();
    unsubscribeField();

    store.setValue('name', 'Ada');

    expect(global).not.toHaveBeenCalled();
    expect(field).not.toHaveBeenCalled();
  });
});
