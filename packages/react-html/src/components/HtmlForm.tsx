import { useMemo, useRef, type FormEvent, type ReactNode } from 'react';
import type { FormSchema } from '@dynamic-form-engine/core';
import { FormErrorSummary, useFormContext } from '@dynamic-form-engine/react';
import { createDefaultHtmlRegistry, type HtmlFieldRegistryOverrides } from '../registry';
import { HtmlFieldRenderer } from '../renderer';
import { renderHtmlLayout } from '../renderer/HtmlLayoutRenderer';
import type { HtmlColorScheme, HtmlDensity } from '../styles';
import { createHtmlLayoutRegistry, type HtmlLayoutNode, type HtmlLayoutRegistryOverrides, type HtmlTabsRenderer } from './layout';
import type { HtmlArrayItemsRenderer } from './structural';

export interface HtmlFormProps {
  schema?: FormSchema;
  registry?: HtmlFieldRegistryOverrides;
  submitLabel?: ReactNode;
  /**
   * Called with the current values after provider validation succeeds. Runs
   * through `FormStore.submit`, so it is skipped while the form is disabled or
   * already submitting, sets `submitting` while pending, and emits `submit`.
   * When omitted, submission is delegated to `FormProvider.submit()` and its
   * `onSubmit`.
   */
  onSubmit?: (values: Readonly<Record<string, unknown>>) => void | Promise<void>;
  /** Receives errors thrown by `onSubmit`. Without it, they are reported with `console.error`. */
  onError?: (error: unknown) => void;
  children?: ReactNode;
  className?: string;
  arrayItemsRenderer?: HtmlArrayItemsRenderer;
  layout?: readonly HtmlLayoutNode[];
  layoutRegistry?: HtmlLayoutRegistryOverrides;
  tabsRenderer?: HtmlTabsRenderer;
  unstyled?: boolean;
  colorScheme?: HtmlColorScheme;
  density?: HtmlDensity;
  dir?: 'ltr' | 'rtl' | 'auto';
  errorSummary?: boolean;
}

export function HtmlForm({ schema: explicitSchema, registry, submitLabel = 'Submit', onSubmit, onError, children, className, arrayItemsRenderer, layout, layoutRegistry, tabsRenderer, unstyled = false, colorScheme = 'auto', density = 'standard', dir, errorSummary = true }: HtmlFormProps) {
  const { schema: providerSchema, store, validateForm, submit } = useFormContext();
  const schema = explicitSchema ?? providerSchema;
  if (!schema) throw new Error('HtmlForm requires a schema prop or a schema supplied to FormProvider.');
  const resolvedRegistry = useMemo(() => createDefaultHtmlRegistry(registry), [registry]);
  const resolvedLayoutRegistry = useMemo(() => createHtmlLayoutRegistry(layoutRegistry), [layoutRegistry]);

  // Guards the async validation window, before the store reports `submitting`.
  const inFlight = useRef(false);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { disabled, submitting } = store.getState();
    if (disabled || submitting || inFlight.current) return;
    inFlight.current = true;
    try {
      if (!onSubmit) {
        // FormProvider.submit() validates, reports failures to its onError, and rethrows.
        await submit().catch(() => undefined);
        return;
      }
      if (!await validateForm()) return;
      await store.submit((values) => onSubmit(values));
    } catch (error) {
      if (onError) onError(error);
      else console.error(error);
    } finally {
      inFlight.current = false;
    }
  };

  const renderField = (field: FormSchema['fields'][number]) => <HtmlFieldRenderer key={field.name} field={field} registry={resolvedRegistry} arrayItemsRenderer={arrayItemsRenderer} />;
  const submitAction = <button type="submit">{submitLabel}</button>;
  const renderedLayout = layout ? renderHtmlLayout({ layout, fields: schema.fields, registry: resolvedLayoutRegistry, renderField, submitAction, tabsRenderer }) : undefined;
  const remainingFields = renderedLayout ? schema.fields.filter((field) => !renderedLayout.referencedFields.has(field.name)) : schema.fields;
  const formClassName = ['df-form', className].filter(Boolean).join(' ');

  return (
    <form
      noValidate
      className={formClassName}
      data-df-unstyled={unstyled ? '' : undefined}
      data-df-color-scheme={colorScheme}
      data-df-density={density}
      dir={dir}
      onSubmit={handleSubmit}
    >
      {errorSummary ? <FormErrorSummary focusOnChange={false} /> : null}
      {renderedLayout?.content}
      {remainingFields.map(renderField)}
      {children}
      {!renderedLayout?.rendersActions ? submitAction : null}
    </form>
  );
}
