/** @vitest-environment happy-dom */
import { cleanup, render } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-forms/core';
import { FormProvider } from '@dynamic-forms/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HTML_DEFAULT_STYLESHEET, HTML_TOKEN_PREFIX, HtmlForm } from './index';

const schema: FormSchema = { id: 'theme', fields: [{ name: 'name', type: 'text', label: 'Name' }] };

afterEach(cleanup);

function renderForm(props: React.ComponentProps<typeof HtmlForm> = {}) {
  const store = new FormStore({ name: 'Ada' });
  return render(<FormProvider store={store} schema={schema}><HtmlForm {...props} /></FormProvider>);
}

describe('Phase 11 styling and theming', () => {
  it('exposes opt-in stylesheet metadata and stable form theme attributes', () => {
    expect(HTML_TOKEN_PREFIX).toBe('--df-');
    expect(HTML_DEFAULT_STYLESHEET).toBe('@dynamic-forms/html/styles.css');
    const view = renderForm({ colorScheme: 'dark', density: 'compact', dir: 'rtl', className: 'consumer-form' });
    const form = view.container.querySelector('form')!;
    expect(form.classList.contains('df-form')).toBe(true);
    expect(form.classList.contains('consumer-form')).toBe(true);
    expect(form.getAttribute('data-df-color-scheme')).toBe('dark');
    expect(form.getAttribute('data-df-density')).toBe('compact');
    expect(form.getAttribute('dir')).toBe('rtl');
  });

  it('provides an explicit unstyled mode while preserving semantic markup', () => {
    const view = renderForm({ unstyled: true });
    const form = view.container.querySelector('form')!;
    expect(form.hasAttribute('data-df-unstyled')).toBe(true);
    expect(view.getByLabelText('Name')).toBeTruthy();
  });

  it('defaults to automatic color scheme and standard density', () => {
    const view = renderForm();
    const form = view.container.querySelector('form')!;
    expect(form.getAttribute('data-df-color-scheme')).toBe('auto');
    expect(form.getAttribute('data-df-density')).toBe('standard');
    expect(form.hasAttribute('data-df-unstyled')).toBe(false);
  });

  it('never injects runtime style elements', () => {
    const view = renderForm({ colorScheme: 'light', density: 'comfortable' });
    expect(view.container.querySelector('style')).toBeNull();
    expect(view.container.querySelector('form')?.getAttribute('data-df-density')).toBe('comfortable');
  });
});
