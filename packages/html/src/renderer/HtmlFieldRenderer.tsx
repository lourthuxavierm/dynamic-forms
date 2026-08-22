import type { ErrorInfo, ReactNode } from 'react';
import type { FieldSchema } from '@dynamic-forms/core';
import { DynamicField } from '@dynamic-forms/react';
import { HtmlFieldErrorBoundary } from '../components/HtmlFieldErrorBoundary';
import { warnInHtmlDevelopment } from '../development';
import type { HtmlFieldRegistry } from '../registry';

export interface HtmlFieldRendererProps {
  field: FieldSchema;
  registry: HtmlFieldRegistry;
  fallback?: ReactNode | ((error: Error, fieldName: string) => ReactNode);
  onError?: (error: Error, info: ErrorInfo, fieldName: string) => void;
}

export function HtmlFieldRenderer({ field, registry, fallback, onError }: HtmlFieldRendererProps) {
  const Control = registry[field.type];
  if (!Control) {
    const known = Object.keys(registry).sort();
    throw new Error('No HTML component registered for field type "' + field.type + '" used by field "' + field.name + '". Registered types: ' + (known.join(', ') || 'none') + '. Register it with createHtmlRegistry or pass a registry override to HtmlForm.');
  }
  if (field.type === 'object' || field.type === 'array') {
    warnInHtmlDevelopment('Field "' + field.name + '" uses structural type "' + field.type + '" before structural rendering is available.');
  }
  return (
    <HtmlFieldErrorBoundary fieldName={field.name} fallback={fallback} onError={onError}>
      <DynamicField field={field} render={(props) => <Control {...props} />} />
    </HtmlFieldErrorBoundary>
  );
}
