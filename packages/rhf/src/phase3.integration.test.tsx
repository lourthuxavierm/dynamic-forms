// @vitest-environment happy-dom
import { useWatch } from 'react-hook-form';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DataSourceConfig, FormSchema } from '@dynamic-form-engine/core';
import {
  createRHFResolver,
  DynamicFormRHFProvider,
  RHFField,
  useDynamicFormRHF,
  useRHFDataSource,
} from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(cleanup);

type Values = {
  kind: string;
  company: string;
  code: string;
  notes: string;
  country: string;
  region: string;
  city: string;
};

const defaults: Values = {
  kind: 'personal', company: '', code: '', notes: '', country: 'A', region: 'CA', city: 'LA',
};

function createSchema(load?: DataSourceConfig<string>['load']): FormSchema {
  return {
    id: 'rhf-phase-3',
    fields: [
      { name: 'kind', type: 'select' },
      {
        name: 'company', type: 'text',
        visibleWhen: { field: 'kind', operator: 'equals', value: 'business' },
        requiredWhen: { field: 'kind', operator: 'equals', value: 'business' },
      },
      { name: 'code', type: 'text', disabledWhen: { field: 'kind', operator: 'equals', value: 'admin' } },
      { name: 'notes', type: 'text', readOnlyWhen: { field: 'kind', operator: 'equals', value: 'admin' } },
      { name: 'country', type: 'select' },
      {
        name: 'region', type: 'text', dependsOn: ['country'], resetOnDependencyChange: true,
        dataSource: load ? { type: 'function', load } : undefined,
      },
    ],
  };
}

function Fields() {
  const values = useWatch<Values>();
  const { methods } = useDynamicFormRHF<Values>();
  return <>
    <RHFField<Values, 'kind'> name="kind" render={({ field }) => (
      <select aria-label="Kind" {...field}><option value="personal">Personal</option><option value="business">Business</option><option value="admin">Admin</option></select>
    )} />
    <RHFField<Values, 'company'> name="company" render={({ field, dynamicState }) => (
      <input aria-label="Company" {...field} value={field.value ?? ''} data-required={String(dynamicState.required)} />
    )} />
    <RHFField<Values, 'code'> name="code" render={({ field }) => <input aria-label="Code" {...field} />} />
    <RHFField<Values, 'notes'> name="notes" render={({ field, dynamicState }) => <input aria-label="Notes" {...field} readOnly={dynamicState.readOnly} />} />
    <RHFField<Values, 'country'> name="country" render={({ field }) => <input aria-label="Country" {...field} />} />
    <RHFField<Values, 'region'> name="region" render={({ field }) => <input aria-label="Region" {...field} />} />
    <RHFField<Values, 'city'> name="city" render={({ field }) => <input aria-label="City" {...field} />} />
    <button type="button" onClick={() => void methods.trigger()}>Validate</button>
    <output aria-label="Values">{JSON.stringify(values)}</output>
  </>;
}

function Harness({
  policy = 'retain', schema = createSchema(), onDataSourceRefresh,
}: {
  policy?: 'retain' | 'unregister';
  schema?: FormSchema;
  onDataSourceRefresh?: (field: unknown, source: unknown, values: Readonly<Values>) => void;
}) {
  return <DynamicFormRHFProvider<Values>
    schema={schema}
    hiddenFieldPolicy={policy}
    onDataSourceRefresh={onDataSourceRefresh}
    formOptions={{ defaultValues: defaults, resolver: createRHFResolver<Values>(schema), mode: 'onChange' }}
  ><Fields /></DynamicFormRHFProvider>;
}

function DataProbe() {
  const source = useRHFDataSource<string>('region', { debounceMs: 0 });
  return <section>
    <output aria-label="Options">{source.data.join(',')}</output>
    <output aria-label="Loading">{String(source.loading)}</output>
    {source.error ? <p role="alert">{source.error.message}</p> : null}
    <button onClick={() => void source.refresh()}>Retry source</button>
  </section>;
}

describe('RHF Phase 3 conditions and dependencies', () => {
  it('retains a hidden value and restores it when visible again', async () => {
    render(<Harness />);
    await waitFor(() => expect(screen.queryByLabelText('Company')).toBeNull());
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'business' } });
    const company = await screen.findByLabelText('Company');
    expect(company.getAttribute('data-required')).toBe('true');
    fireEvent.change(company, { target: { value: 'Acme' } });
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'personal' } });
    await waitFor(() => expect(screen.queryByLabelText('Company')).toBeNull());
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'business' } });
    expect(await screen.findByLabelText('Company')).toHaveProperty('value', 'Acme');
  });

  it('unregisters hidden values under the unregister policy', async () => {
    render(<Harness policy="unregister" />);
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'business' } });
    fireEvent.change(await screen.findByLabelText('Company'), { target: { value: 'Acme' } });
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'personal' } });
    await waitFor(() => expect(screen.queryByLabelText('Company')).toBeNull());
    await waitFor(() => expect(JSON.parse(screen.getByLabelText('Values').textContent ?? '{}').company).toBeUndefined());
  });

  it('drives disabled and read-only state from current RHF values', async () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'admin' } });
    await waitFor(() => expect((screen.getByLabelText('Code') as HTMLInputElement).disabled).toBe(true));
    expect(screen.getByLabelText('Notes')).toHaveProperty('readOnly', true);
  });

  it('resets dependents and reports refreshes after an upstream change', async () => {
    const refresh = vi.fn();
    render(<Harness schema={createSchema(async () => [])} onDataSourceRefresh={refresh} />);
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'TX' } });
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'B' } });
    await waitFor(() => expect(screen.getByLabelText('Region')).toHaveProperty('value', 'CA'));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

describe('RHF Phase 3 data sources', () => {
  it('suppresses stale responses and supports error retry', async () => {
    let errorAttempts = 0;
    const load: NonNullable<DataSourceConfig<string>['load']> = async ({ values }) => {
      const country = String(values.country);
      if (country === 'A') await new Promise((resolve) => setTimeout(resolve, 30));
      if (country === 'B') await new Promise((resolve) => setTimeout(resolve, 20));
      if (country === 'ERR' && errorAttempts++ === 0) throw new Error('Source unavailable');
      return [`${country}-option`];
    };
    const schema = createSchema(load);
    render(<DynamicFormRHFProvider<Values> schema={schema} formOptions={{ defaultValues: defaults }}>
      <Fields /><DataProbe />
    </DynamicFormRHFProvider>);

    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'B' } });
    await waitFor(() => expect(screen.getByLabelText('Options').textContent).toBe('B-option'));
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(screen.getByLabelText('Options').textContent).toBe('B-option');

    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'ERR' } });
    await screen.findByText('Source unavailable');
    fireEvent.click(screen.getByText('Retry source'));
    await waitFor(() => expect(screen.getByLabelText('Options').textContent).toBe('ERR-option'));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});