import type { Type } from '@angular/core';

export type AngularHtmlFieldComponent = Type<unknown>;
export type AngularHtmlRegistry = Readonly<Record<string, AngularHtmlFieldComponent>>;
export type AngularHtmlRegistryOverrides = Readonly<Record<string, AngularHtmlFieldComponent | undefined>>;

export function createAngularHtmlRegistry(overrides: AngularHtmlRegistryOverrides = {}): AngularHtmlRegistry {
  const result: Record<string, AngularHtmlFieldComponent> = {};
  for (const [type, component] of Object.entries(overrides)) if (component) result[type] = component;
  return Object.freeze(result);
}

export const ANGULAR_HTML_BASELINE_FIELD_TYPES = Object.freeze([
  'text', 'textarea', 'email', 'password', 'url', 'number', 'integer', 'decimal',
  'checkbox', 'select', 'radio', 'date', 'time', 'datetime', 'hidden',
] as const);
