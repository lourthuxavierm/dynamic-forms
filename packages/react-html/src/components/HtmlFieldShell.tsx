import type { ReactNode } from 'react';
import type { FieldComponentProps } from '@dynamic-forms/react';

export interface HtmlFieldShellProps {
  props: FieldComponentProps;
  children: ReactNode;
  hideLabel?: boolean;
}

export function HtmlFieldShell({ props, children, hideLabel = false }: HtmlFieldShellProps) {
  const { field, error, touched, dirty, isValidating, accessibility } = props;
  return (
    <div
      className={[
        'df-field',
        error && 'df-field-invalid',
        props.disabled && 'df-field-disabled',
        props.readOnly && 'df-field-readonly',
      ].filter(Boolean).join(' ')}
      data-dynamic-forms-control=""
      data-field-name={props.name}
      data-touched={touched || undefined}
      data-dirty={dirty || undefined}
      data-validating={isValidating || undefined}
      data-invalid={Boolean(error) || undefined}
    >
      {!hideLabel && <label id={accessibility.labelId} htmlFor={accessibility.id}>{field.label ?? field.name}{props.required ? ' *' : ''}</label>}
      <div className={'df-field-control'}>{children}</div>
      {field.description && <div id={accessibility.descriptionId}>{field.description}</div>}
      {error && <div id={accessibility.errorId} role="alert">{error}</div>}
      {isValidating && <span {...accessibility.validationLiveRegion}>Validating</span>}
    </div>
  );
}
