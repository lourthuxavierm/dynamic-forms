/** @vitest-environment happy-dom */
import { cleanup, render } from '@testing-library/react';
import { FormStore, type FieldSchema, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider } from '@dynamic-form-engine/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HtmlForm, V1_HTML_FIELD_TYPES, createDefaultHtmlRegistry } from './index';

afterEach(cleanup);

const options = [
  { label: 'First', value: 'first' },
  { label: 'Second', value: 'second' },
];

const initialValues: Partial<Record<(typeof V1_HTML_FIELD_TYPES)[number], unknown>> = {
  'multi-select': [],
  'checkbox-group': [],
  'toggle-button-group': [],
  checkbox: false,
  switch: false,
  'range-slider': [20, 80],
  'date-range': ['', ''],
  'time-range': ['', ''],
  'datetime-range': ['', ''],
  'multi-file': [],
};

describe('v1 leaf-control rendering matrix', () => {
  it.each(V1_HTML_FIELD_TYPES)('%s resolves and renders its field shell without changing the initial value', (type) => {
    const field: FieldSchema = { name: 'value', type, label: 'Value', options };
    const schema: FormSchema = { id: 'control-matrix', fields: [field] };
    const initialValue = initialValues[type];
    const store = new FormStore({ value: initialValue });
    const view = render(<FormProvider schema={schema} store={store}><HtmlForm errorSummary={false} /></FormProvider>);
    expect(createDefaultHtmlRegistry()[type]).toBeDefined();
    if (type === 'hidden') {
      expect(view.container.querySelector('input[type="hidden"][name="value"]')).not.toBeNull();
    } else {
      expect(view.container.querySelector('[data-field-name="value"]')).not.toBeNull();
    }
    expect(store.getValue('value')).toEqual(initialValue);
  });
});
