import type { FieldComponentProps } from '@dynamic-form-engine/react';
import type { FieldValue, ValueFieldSchema } from '@dynamic-form-engine/core';
import { describe, expect, it } from 'vitest';
import type { HtmlFieldComponent, HtmlFieldRegistration, HtmlFieldRegistryOverrides, TypedHtmlFieldComponent } from '../index';

function StringControl(_props: FieldComponentProps<string>) {
  return null;
}

function checkCompileTimeContracts() {
  const typed: TypedHtmlFieldComponent<string> = StringControl;
  const registration: HtmlFieldRegistration<string> = { type: 'custom-text', component: typed };
  const overrides: HtmlFieldRegistryOverrides = { text: typed, removed: undefined };
  const component: HtmlFieldComponent = typed;
  const currencyValue: FieldValue<'currency'> = 12.5;
  const currencyField: ValueFieldSchema<'currency'> = {
    name: 'total',
    type: 'currency',
    defaultValue: currencyValue,
    config: { currency: 'USD', precision: 2 },
  };
  void registration;
  void overrides;
  void component;
  void currencyField;

  // @ts-expect-error A control cannot require props absent from FieldComponentProps.
  const invalidComponent: HtmlFieldComponent = (_props: { unsupportedRequiredProp: string }) => null;
  // @ts-expect-error Registry entries must be field components, not arbitrary values.
  const invalidOverride: HtmlFieldRegistryOverrides = { text: 'not a component' };
  // @ts-expect-error A typed control must agree with its declared value type.
  const invalidRegistration: HtmlFieldRegistration<number> = { type: 'numeric', component: StringControl };
  // @ts-expect-error Currency defaults are numeric, not formatted strings.
  const invalidCurrencyValue: FieldValue<'currency'> = '$12.50';
  // @ts-expect-error Numeric min constraints cannot be strings.
  const invalidCurrencyConfig: ValueFieldSchema<'currency'> = { name: 'total', type: 'currency', config: { min: '0' } };
  void invalidComponent;
  void invalidOverride;
  void invalidRegistration;
  void invalidCurrencyValue;
  void invalidCurrencyConfig;
}

describe('HTML registry type contract', () => {
  it('is checked by TypeScript without executing invalid examples', () => {
    expect(typeof checkCompileTimeContracts).toBe('function');
  });
});
