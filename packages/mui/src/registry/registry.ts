import type { MuiFieldComponent, MuiFieldRegistry, MuiFieldRegistryOverrides } from './types';

/** Combines registries left-to-right; later entries intentionally override earlier entries. */
export function mergeMuiRegistries(...registries: ReadonlyArray<MuiFieldRegistryOverrides>): MuiFieldRegistry {
  const result: Record<string, MuiFieldComponent> = {};
  for (const registry of registries) {
    for (const [type, component] of Object.entries(registry)) {
      if (component) result[type] = component;
    }
  }
  return result;
}

/** Creates a registry without exposing mutable registry state to renderers. */
export function createMuiRegistry(initial: MuiFieldRegistryOverrides = {}): MuiFieldRegistry {
  return mergeMuiRegistries(initial);
}