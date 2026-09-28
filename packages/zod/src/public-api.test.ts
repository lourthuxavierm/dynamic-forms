import { describe, expect, expectTypeOf, it } from 'vitest';
import apiReport from '../api-report.json';
import packageJson from '../package.json';
import * as adapter from './index';
import {
  createZodFormValidator,
  createZodFieldValidator,
  zodIssuesToFormErrors,
  zodIssueToValidationIssue,
  zodPathToFieldPath,
} from './index';
import type { ZodAdapterOptions, ZodFieldValidatorOptions, ZodSchemaLike } from './index';

describe('@dynamic-form-engine/zod Phase 1 public surface', () => {
  it('exports form and field validation factories', () => {
    expect(adapter).not.toHaveProperty('ZOD_ADAPTER');
    expect(createZodFieldValidator).toBeTypeOf('function');
    expect(createZodFormValidator).toBeTypeOf('function');
    expect(zodPathToFieldPath).toBeTypeOf('function');
    expect(zodIssuesToFormErrors).toBeTypeOf('function');
    expect(zodIssueToValidationIssue).toBeTypeOf('function');
  });

  it('publishes framework-neutral structural contracts', () => {
    expectTypeOf<ZodSchemaLike<{ email: string }>['safeParseAsync']>().toBeFunction();
    expectTypeOf<ZodAdapterOptions['errorMode']>().toEqualTypeOf<'first' | 'all' | undefined>();
    expectTypeOf<ZodFieldValidatorOptions['errorMode']>().toEqualTypeOf<'first' | 'all' | undefined>();
  });

  it('ships exactly the runtime exports recorded in api-report.json', () => {
    const report = apiReport as { exports: Record<string, { kind: string }> };
    const recorded = Object.entries(report.exports).filter(([, entry]) => ['class', 'function', 'const', 'enum'].includes(entry.kind)).map(([name]) => name).sort();
    expect(Object.keys(adapter).sort()).toEqual(recorded);
  });

  it('keeps Zod a peer dependency and depends only on Core', () => {
    const manifest = packageJson as { peerDependencies: Record<string, string>; dependencies: Record<string, string> };
    expect(manifest.peerDependencies).toEqual({ zod: '^3.25.5 || ^4.0.0' });
    expect(Object.keys(manifest.dependencies)).toEqual(['@dynamic-form-engine/core']);
  });
});
