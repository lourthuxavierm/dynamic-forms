import { describe, expect, it } from 'vitest';
import { FormRuntime } from '../runtime';
import { compileSchema, compileSchemaOrThrow, explainField } from './compilation';

describe('schema compilation', () => {
  it('builds immutable runtime indexes', () => {
    const compiled = compileSchemaOrThrow({ id: 'compiled', fields: [
      { name: 'country', type: 'select' },
      { name: 'state', type: 'select', dependsOn: ['country'], visibleWhen: { field: 'country', operator: 'exists' }, dataSource: { type: 'url', url: '/states', params: { country: { fromField: 'country' } } }, validation: { required: true } },
    ] });
    expect(compiled.fieldsByPath.get('state')?.label).toBe('State');
    expect(compiled.dependencyGraph.dependenciesByField.get('state')).toEqual(['country']);
    expect(compiled.dependencyGraph.dependentsByField.get('country')).toEqual(['state']);
    expect(compiled.conditionDependentsByField.get('country')).toEqual(['state']);
    expect(compiled.dataSourceDependentsByField.get('country')).toEqual(['state']);
    expect(compiled.validationByPath.has('state')).toBe(true);
    expect(Object.isFrozen(compiled)).toBe(true);
    expect('set' in compiled.fieldsByPath).toBe(false);
    expect(explainField(compiled, 'state')).toMatchObject({ dependencies: ['country'], conditionSources: ['country'], dataSourceSources: ['country'], hasValidation: true, hasDefault: true });
  });
  it('returns diagnostics instead of a partial schema', () => {
    const result = compileSchema({ id: 'invalid', fields: [{ name: 'a', type: 'text', dependsOn: ['missing'] }] });
    expect(result.valid).toBe(false); expect(result.schema).toBeUndefined(); expect(result.diagnostics[0]?.code).toBe('DEPENDENCY_REFERENCE_NOT_FOUND');
  });
  it('makes runtime controllers consume the compiled contract', () => {
    const runtime = new FormRuntime({ id: 'runtime-compiled', fields: [{ name: 'enabled', type: 'checkbox' }, { name: 'details', type: 'text', visibleWhen: { field: 'enabled', operator: 'equals', value: true } }] });
    expect(runtime.compiledSchema.fieldsByPath.get('details')).toBe(runtime.schema.fields[1]);
    expect(runtime.explainField('details').conditionSources).toEqual(['enabled']);
    expect(runtime.conditions.getState('details')?.visible).toBe(false);
    runtime.setValue('enabled', true); expect(runtime.conditions.getState('details')?.visible).toBe(true); runtime.dispose();
  });
  it('keeps the builder-facing compiled summary stable', () => {
    const compiled = compileSchemaOrThrow({ id: 'summary', fields: [
      { name: 'country', type: 'select', options: [{ label: 'India', value: 'IN' }] },
      { name: 'state', type: 'select', dependsOn: ['country'], visibleWhen: { field: 'country', operator: 'equals', value: 'IN' }, dataSource: { type: 'url', url: '/states', params: { country: '$country' } }, validation: { required: true } },
    ] });
    const summary = {
      fields: [...compiled.fieldsByPath.keys()],
      dependencies: [...compiled.dependencyGraph.dependenciesByField],
      conditions: [...compiled.conditionDependentsByField],
      dataSources: [...compiled.dataSourceDependentsByField],
      validation: [...compiled.validationByPath.keys()],
      diagnostics: compiled.diagnostics.map(({ code, severity, path }) => ({ code, severity, path })),
    };
    expect(summary).toMatchInlineSnapshot(`
      {
        "conditions": [
          [
            "country",
            [
              "state",
            ],
          ],
        ],
        "dataSources": [
          [
            "country",
            [
              "state",
            ],
          ],
        ],
        "dependencies": [
          [
            "country",
            [],
          ],
          [
            "state",
            [
              "country",
            ],
          ],
        ],
        "diagnostics": [],
        "fields": [
          "country",
          "state",
        ],
        "validation": [
          "state",
        ],
      }
    `);
  });
});
