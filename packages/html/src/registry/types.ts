import type { TypedHtmlFieldComponent, HtmlFieldComponent } from '../components';

export type HtmlFieldRegistry = Readonly<Record<string, HtmlFieldComponent>>;
export type HtmlFieldRegistryOverrides = Readonly<Record<string, HtmlFieldComponent | undefined>>;

export interface HtmlFieldRegistration<T = unknown> {
  type: string;
  component: TypedHtmlFieldComponent<T>;
}
