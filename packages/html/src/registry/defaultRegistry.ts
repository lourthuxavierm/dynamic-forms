import {
  HtmlAsyncAutocomplete,
  HtmlAutocomplete,
  HtmlCheckboxGroup,
  HtmlRadioGroup,
  HtmlSearchableSelect,
  HtmlSwitch,
  HtmlToggleButtonGroup,
  HtmlTreeCheckbox,
  HtmlTreeSelect,
} from '../components/composites';
import type { HtmlFieldRegistry, HtmlFieldRegistryOverrides } from './types';
import { mergeHtmlRegistries } from './registry';
import {
  HtmlCheckbox,
  HtmlDateField,
  HtmlDateTimeField,
  HtmlDecimalField,
  HtmlEmailField,
  HtmlFileField,
  HtmlHiddenField,
  HtmlIntegerField,
  HtmlMonthField,
  HtmlMultiSelect,
  HtmlNumberField,
  HtmlPasswordField,
  HtmlRadio,
  HtmlSelect,
  HtmlTextField,
  HtmlTextarea,
  HtmlTimeField,
  HtmlUrlField,
} from '../components/baseline';

const DEFAULT_HTML_REGISTRY: HtmlFieldRegistry = Object.freeze({
  text: HtmlTextField,
  textarea: HtmlTextarea,
  password: HtmlPasswordField,
  email: HtmlEmailField,
  url: HtmlUrlField,
  number: HtmlNumberField,
  integer: HtmlIntegerField,
  decimal: HtmlDecimalField,
  hidden: HtmlHiddenField,
  checkbox: HtmlCheckbox,
  'checkbox-group': HtmlCheckboxGroup,
  'radio-group': HtmlRadioGroup,
  switch: HtmlSwitch,
  autocomplete: HtmlAutocomplete,
  'async-autocomplete': HtmlAsyncAutocomplete,
  'searchable-select': HtmlSearchableSelect,
  'tree-select': HtmlTreeSelect,
  'tree-checkbox': HtmlTreeCheckbox,
  'toggle-button-group': HtmlToggleButtonGroup,
  radio: HtmlRadio,
  select: HtmlSelect,
  'multi-select': HtmlMultiSelect,
  date: HtmlDateField,
  time: HtmlTimeField,
  datetime: HtmlDateTimeField,
  month: HtmlMonthField,
  file: HtmlFileField,
});
const defaultRegistryCache = new WeakMap<object, HtmlFieldRegistry>();

export function createDefaultHtmlRegistry(overrides?: HtmlFieldRegistryOverrides): HtmlFieldRegistry {
  if (!overrides) return DEFAULT_HTML_REGISTRY;
  const cached = defaultRegistryCache.get(overrides);
  if (cached) return cached;
  const registry = mergeHtmlRegistries(DEFAULT_HTML_REGISTRY, overrides);
  defaultRegistryCache.set(overrides, registry);
  return registry;
}
