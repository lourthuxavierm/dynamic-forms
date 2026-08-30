/** @vitest-environment happy-dom */
import { fireEvent, render, screen } from '@testing-library/react';
import { FormStore, type FormSchema } from '@dynamic-form-engine/core';
import { FormProvider, type FieldComponentProps } from '@dynamic-form-engine/react';
import { describe, expect, it, vi } from 'vitest';
import {
  HtmlFieldRenderer,
  HtmlForm,
  createDefaultHtmlRegistry,
  createHtmlRegistry,
  mergeHtmlRegistries,
  type HtmlFieldRegistryOverrides,
} from './index';

const schema: FormSchema = { id: 'html-phase-3', fields: [{ name: 'name', type: 'text', label: 'Name' }] };

function TextControl(props: FieldComponentProps<string>) {
  return <label id={props.accessibility.labelId}>Name<input
    id={props.accessibility.id}
    name={props.name}
    value={props.value ?? ''}
    onChange={(event) => props.setValue(event.target.value)}
  /></label>;
}

describe('HTML registry', () => {
  it('creates immutable registries, merges overrides, and removes undefined entries', () => {
    const first = createHtmlRegistry({ text: TextControl });
    const merged = mergeHtmlRegistries(first, { text: undefined, custom: TextControl });
    expect(Object.isFrozen(first)).toBe(true);
    expect(merged.text).toBeUndefined();
    expect(merged.custom).toBe(TextControl);
  });

  it('keeps default and override registry instances referentially stable', () => {
    const overrides: HtmlFieldRegistryOverrides = { text: TextControl };
    expect(createDefaultHtmlRegistry()).toBe(createDefaultHtmlRegistry());
    expect(createDefaultHtmlRegistry(overrides)).toBe(createDefaultHtmlRegistry(overrides));
    expect(createHtmlRegistry(overrides)).toBe(createHtmlRegistry(overrides));
  });
});

describe('HTML renderer', () => {
  it('renders custom controls and per-form overrides through headless field props', () => {
    const store = new FormStore({ name: 'Ada' });
    render(<FormProvider store={store} schema={schema}><HtmlForm registry={{ text: TextControl }} schema={schema} /></FormProvider>);
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Grace' } });
    expect(store.getValue('name')).toBe('Grace');
  });

  it('provides an actionable missing-control error', () => {
    const store = new FormStore({ name: '' });
    expect(() => render(<FormProvider store={store} schema={schema}><HtmlFieldRenderer field={schema.fields[0]} registry={createHtmlRegistry()} /></FormProvider>))
      .toThrow(/No HTML component registered.*text.*createHtmlRegistry/s);
  });

  it('isolates field failures with a customizable error boundary', () => {
    const Broken = () => { throw new Error('control failed'); };
    const onError = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const store = new FormStore({ name: '' });
    render(<FormProvider store={store} schema={schema}><HtmlFieldRenderer
      field={schema.fields[0]}
      registry={createHtmlRegistry({ text: Broken })}
      fallback={<span>Field unavailable</span>}
      onError={onError}
    /></FormProvider>);
    expect(screen.getByText('Field unavailable')).toBeTruthy();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object), 'name');
    consoleError.mockRestore();
  });

  it('validates before form submission', async () => {
    const requiredSchema: FormSchema = { id: 'required', fields: [{ name: 'name', type: 'text', label: 'Name', validation: { required: true } }] };
    const onSubmit = vi.fn();
    const view = render(<FormProvider store={new FormStore({ name: '' })} schema={requiredSchema}><HtmlForm registry={{ text: TextControl }} onSubmit={onSubmit} /></FormProvider>);
    fireEvent.click(view.container.querySelector('button[type=submit]')!);
    await vi.waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });
});
