import { useMemo, type FormEvent, type ReactNode } from 'react';
import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';
import { FormErrorSummary, useFormContext } from '@lourthuxavierm/dynamic-forms-react';
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

export function HtmlForm({ schema: explicitSchema, registry, submitLabel = 'Submit', onSubmit, children, className, arrayItemsRenderer, layout, layoutRegistry, tabsRenderer, unstyled = false, colorScheme = 'auto', density = 'standard', dir, errorSummary = true }: HtmlFormProps) {
  const { schema: providerSchema, store, validateForm } = useFormContext();
  const schema = explicitSchema ?? providerSchema;
  if (!schema) throw new Error('HtmlForm requires a schema prop or a schema supplied to FormProvider.');
  const resolvedRegistry = useMemo(() => createDefaultHtmlRegistry(registry), [registry]);
  const resolvedLayoutRegistry = useMemo(() => createHtmlLayoutRegistry(layoutRegistry), [layoutRegistry]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!await validateForm()) return;
    await onSubmit?.(store.getValues());
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
