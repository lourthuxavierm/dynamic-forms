import type { ComponentType } from 'react';
import type { FieldComponentProps } from '@dynamic-form-engine/react';

/** A registry control must accept the headless field contract.
 * The value type is open because one registry may contain controls for different value types.
 */
export type HtmlFieldComponent = ComponentType<FieldComponentProps<any>>;
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
