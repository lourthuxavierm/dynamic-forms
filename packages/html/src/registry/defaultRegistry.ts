import type { HtmlFieldRegistry, HtmlFieldRegistryOverrides } from './types';
import { mergeHtmlRegistries } from './registry';

const DEFAULT_HTML_REGISTRY: HtmlFieldRegistry = Object.freeze(Object.create(null));
const defaultRegistryCache = new WeakMap<object, HtmlFieldRegistry>();

export function createDefaultHtmlRegistry(overrides?: HtmlFieldRegistryOverrides): HtmlFieldRegistry {
  if (!overrides) return DEFAULT_HTML_REGISTRY;
  const cached = defaultRegistryCache.get(overrides);
  if (cached) return cached;
  const registry = mergeHtmlRegistries(DEFAULT_HTML_REGISTRY, overrides);
  defaultRegistryCache.set(overrides, registry);
  return registry;
}
