import type { ComponentType } from 'react';
import type { FieldComponentProps } from '@lourthuxavierm/dynamic-forms-react';

export type HtmlFieldComponent = ComponentType<any>;
export type TypedHtmlFieldComponent<T = unknown> = ComponentType<FieldComponentProps<T>>;

export * from './HtmlFieldErrorBoundary';
export * from './HtmlFieldShell';
export * from './HtmlForm';
export * from './baseline';

export * from './composites';
export * from './specialized';
export * from './numericFormat';
export * from './temporalValues';
export { createHtmlTemporalField, HtmlDateRangeField, HtmlTimeRangeField, HtmlDateTimeRangeField } from './temporal';
export type { HtmlTemporalEnhancer, HtmlTemporalEnhancementContext } from './temporal';
export * from './fileMedia';

export * from './structural';
export * from './layout';
