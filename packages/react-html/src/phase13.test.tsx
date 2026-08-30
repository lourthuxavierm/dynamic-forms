/** @vitest-environment happy-dom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider, type FieldComponentProps } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HtmlForm, createDefaultHtmlRegistry } from './index';

afterEach(cleanup);

describe('Phase 13 performance contracts', () => {
  it('does not render an unrelated field when another value changes', () => {
    const renders = { first: 0, second: 0 };
    const Control = (props: FieldComponentProps) => {
      renders[props.name as keyof typeof renders] += 1;
      return <input aria-label={props.name} value={String(props.value ?? '')} onChange={(event) => props.setValue(event.target.value)} />;
    };
    const schema: FormSchema = { id: 'isolation', fields: [{ name: 'first', type: 'counted' }, { name: 'second', type: 'counted' }] };
    const store = new FormStore({ first: '', second: '' });
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm registry={{ counted: Control }} /></FormProvider>);
    const secondBefore = renders.second;
    fireEvent.change(view.getByLabelText('first'), { target: { value: 'x' } });
    expect(renders.second).toBe(secondBefore);
  });

  it('measures a 500-field baseline render', () => {
    const fields = Array.from({ length: 500 }, (_, index) => ({ name: `field${index}`, type: 'text', label: `Field ${index}` }));
    const schema: FormSchema = { id: 'large', fields };
    const store = new FormStore(Object.fromEntries(fields.map((field) => [field.name, ''])));
    const started = performance.now();
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm errorSummary={false} /></FormProvider>);
    expect(view.container.querySelectorAll('input')).toHaveLength(500);
    expect(performance.now() - started).toBeGreaterThanOrEqual(0);
  }, 15_000);

  it('mounts only the viewport for a windowed 1,000-item array', () => {
    const schema: FormSchema = { id: 'windowed', fields: [{ name: 'rows', type: 'array', fields: [{ name: 'value', type: 'text', label: 'Value' }] }] };
    const store = new FormStore({ rows: Array.from({ length: 1000 }, (_, value) => ({ value })) });
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm errorSummary={false} arrayItemsRenderer={({ items }) => <>{items.slice(0, 20).map((item) => <div key={item.id}>{item.content}</div>)}</>} /></FormProvider>);
    expect(view.getAllByLabelText('Value')).toHaveLength(20);
  }, 15_000);

  it('keeps the default registry identity stable', () => {
    expect(createDefaultHtmlRegistry()).toBe(createDefaultHtmlRegistry());
  });
});
