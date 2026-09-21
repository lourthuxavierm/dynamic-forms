import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { FormSchema } from '@dynamic-form-engine/core';
import { FormErrorSummary, useFormContext, useFormState } from '@dynamic-form-engine/react';
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
  onSubmit?: (values: Readonly<Record<string, unknown>>) => void | Promise<void>;
  onSubmitError?: (error: unknown) => void;
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

export function HtmlForm({ schema: explicitSchema, registry, submitLabel = 'Submit', onSubmit, onSubmitError, children, className, arrayItemsRenderer, layout, layoutRegistry, tabsRenderer, unstyled = false, colorScheme = 'auto', density = 'standard', dir, errorSummary = true }: HtmlFormProps) {
  const { schema: providerSchema, store, validateForm } = useFormContext();
  const submitting = useFormState((state) => state.submitting);
  const pendingSubmit = useRef(false);
  const [submitError, setSubmitError] = useState<string>();
  const schema = explicitSchema ?? providerSchema;
  if (!schema) throw new Error('HtmlForm requires a schema prop or a schema supplied to FormProvider.');
  const resolvedRegistry = useMemo(() => createDefaultHtmlRegistry(registry), [registry]);
  const resolvedLayoutRegistry = useMemo(() => createHtmlLayoutRegistry(layoutRegistry), [layoutRegistry]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pendingSubmit.current || store.getState().submitting || store.getState().disabled) return;
    pendingSubmit.current = true;
    setSubmitError(undefined);
    try {
      if (!await validateForm()) return;
      if (onSubmit) await store.submit(onSubmit);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
      onSubmitError?.(error);
    } finally {
      pendingSubmit.current = false;
    }
  };

  const renderField = (field: FormSchema['fields'][number]) => <HtmlFieldRenderer key={field.id ?? field.name} field={field} registry={resolvedRegistry} arrayItemsRenderer={arrayItemsRenderer} />;
  const submitAction = <button type="submit" disabled={submitting}>{submitLabel}</button>;
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
      aria-busy={submitting || undefined}
    >
      {errorSummary ? <FormErrorSummary focusOnChange={false} /> : null}
      {submitError ? <p role="alert">{submitError}</p> : null}
      {renderedLayout?.content}
      {remainingFields.map(renderField)}
      {children}
      {!renderedLayout?.rendersActions ? submitAction : null}
    </form>
  );
}
