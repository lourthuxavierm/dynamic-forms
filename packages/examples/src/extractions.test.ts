import { describe, expect, it } from 'vitest';
import { baseLayoutMetadata } from './layouts';
import { buildDataSourceQuery, createDataSourceCacheKey, filterCityFixtures, normalizeCityOptions } from './dataSources';
import { createExampleIdentityFactory, createWorker, validateWorkers } from './nestedArrays';
import { permissionInitialValues, redactPermissionValues, resolvePermissionPolicy } from './permissions';

describe('shared enterprise example contracts', () => {
  it('builds deterministic data-source queries and cache keys', () => {
    const input = { source: 'api' as const, country: 'IN', search: 'ben', paging: 'page' as const, page: 2, cursor: 'start', simulation: 'normal' as const };
    expect(buildDataSourceQuery(input)).toEqual({ country: 'IN', q: 'ben', page: 2, pageSize: 10 });
    expect(createDataSourceCacheKey(input)).toBe('api:IN:ben:page:2:start:normal');
    expect(normalizeCityOptions(filterCityFixtures('IN', 'ben'))).toEqual([{ label: 'Bengaluru', value: 'blr' }]);
  });

  it('creates stable nested-array identities and validates domain rules', () => {
    const identity = createExampleIdentityFactory();
    const employee = createWorker(identity, 'Ada');
    const contractor = createWorker(identity, 'Grace', 'contractor');
    expect(employee.id).not.toBe(contractor.id);
    expect(validateWorkers([employee, contractor]).items[1]).toContain('contract end date');
  });

  it('resolves permissions and redacts sensitive diagnostics', () => {
    expect(resolvePermissionPolicy('viewer', 'salary').mode).toBe('hidden');
    expect(redactPermissionValues(permissionInitialValues)).toMatchObject({ salary: '[REDACTED]', apiToken: '[REDACTED]', displayName: 'Ada Lovelace' });
  });

  it('provides unique adapter-neutral layout metadata', () => {
    expect(new Set(baseLayoutMetadata.map(({ id }) => id)).size).toBe(baseLayoutMetadata.length);
  });
});
