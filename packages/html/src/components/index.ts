import type { ComponentType } from 'react';
import type { FieldComponentProps } from '@dynamic-forms/react';

/** Heterogeneous registry boundary; use HtmlFieldRegistration for typed registration. */
export type HtmlFieldComponent = ComponentType<any>;
export type TypedHtmlFieldComponent<T = unknown> = ComponentType<FieldComponentProps<T>>;

export * from './HtmlFieldErrorBoundary';
export * from './HtmlForm';
