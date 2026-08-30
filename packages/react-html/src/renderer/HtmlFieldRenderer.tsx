import { memo, Suspense, type ErrorInfo, type ReactNode } from 'react';
import type { FieldSchema } from '@dynamic-form-engine/core';
import { DynamicField } from '@dynamic-form-engine/react';
import { HtmlFieldErrorBoundary } from '../components/HtmlFieldErrorBoundary';
import { HtmlStructuralField, type HtmlArrayItemsRenderer } from '../components/structural';
import type { HtmlFieldRegistry } from '../registry';

export interface HtmlFieldRendererProps {
  field: FieldSchema;
  registry: HtmlFieldRegistry;
  arrayItemsRenderer?: HtmlArrayItemsRenderer;
  fallback?: ReactNode | ((error: Error, fieldName: string) => ReactNode);
  onError?: (error: Error, info: ErrorInfo, fieldName: string) => void;
}

export const HtmlFieldRenderer = memo(function HtmlFieldRenderer({ field, registry, arrayItemsRenderer, fallback, onError }: HtmlFieldRendererProps) {
  const render = (candidate: FieldSchema): ReactNode => (
    <HtmlFieldRenderer field={candidate} registry={registry} arrayItemsRenderer={arrayItemsRenderer} fallback={fallback} onError={onError} />
  );
  if (field.type === 'object' || field.type === 'array') {
    return (
      <HtmlFieldErrorBoundary fieldName={field.name} fallback={fallback} onError={onError}>
        <HtmlStructuralField field={field} name={field.name} registry={registry} arrayItemsRenderer={arrayItemsRenderer} renderLeaf={render} />
      </HtmlFieldErrorBoundary>
    );
  }
  const Control = registry[field.type];
  if (!Control) {
    const known = Object.keys(registry).sort();
    throw new Error('No HTML component registered for field type "' + field.type + '" used by field "' + field.name + '". Registered types: ' + (known.join(', ') || 'none') + '. Register it with createHtmlRegistry or pass a registry override to HtmlForm.');
  }
  return (
    <HtmlFieldErrorBoundary fieldName={field.name} fallback={fallback} onError={onError}>
      <Suspense fallback={<span role="status" aria-live="polite">Loading field…</span>}>
        <DynamicField field={field} render={(props) => <Control {...props} />} />
      </Suspense>
    </HtmlFieldErrorBoundary>
  );
});
