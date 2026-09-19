// @vitest-environment happy-dom
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DynamicFormRHFProvider } from './provider';

describe('RHF provider projection', () => {
  it('does not refresh dependencies for an identical initial snapshot', async () => {
    const refresh = vi.fn();
    render(<DynamicFormRHFProvider
      schema={{ id: 'initial', fields: [{ name: 'source', type: 'text' }, { name: 'target', type: 'text', dependsOn: ['source'], dataSource: { type: 'function', load: async () => [] } }] }}
      formOptions={{ defaultValues: { source: 'a', target: 'b' } }}
      onDataSourceRefresh={refresh}
    ><span /></DynamicFormRHFProvider>);
    await Promise.resolve();
    expect(refresh).not.toHaveBeenCalled();
  });
});
