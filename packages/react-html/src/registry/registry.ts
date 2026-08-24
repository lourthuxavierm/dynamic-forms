import type { HtmlFieldComponent } from '../components';
import type { HtmlFieldRegistration, HtmlFieldRegistry, HtmlFieldRegistryOverrides } from './types';

const registryCache = new WeakMap<object, HtmlFieldRegistry>();

export function mergeHtmlRegistries(...registries: readonly HtmlFieldRegistryOverrides[]): HtmlFieldRegistry {
  const result: Record<string, HtmlFieldComponent> = Object.create(null);
  for (const registry of registries) {
    for (const [type, component] of Object.entries(registry)) {
      if (component) result[type] = component;
      else delete result[type];
    }
  }
  return Object.freeze(result);
}

export function createHtmlRegistry(
  initial: HtmlFieldRegistryOverrides | readonly HtmlFieldRegistration[] = {},
): HtmlFieldRegistry {
  if (typeof initial === 'object' && initial !== null) {
    const cached = registryCache.get(initial);
    if (cached) return cached;
  }
  const registry = Array.isArray(initial)
    ? mergeHtmlRegistries(Object.fromEntries(initial.map((entry) => [entry.type, entry.component])))
    : mergeHtmlRegistries(initial as HtmlFieldRegistryOverrides);
  if (typeof initial === 'object' && initial !== null) registryCache.set(initial, registry);
  return registry;
}
