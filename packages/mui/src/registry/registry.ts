import type { ComponentType } from "react";

export type MuiFieldComponent = ComponentType<any>;

export interface MuiFieldRegistry {
  register(
    type: string,
    component: MuiFieldComponent
  ): void;

  get(
    type: string
  ): MuiFieldComponent | undefined;
}

export function createMuiRegistry(
  initial: Record<string, MuiFieldComponent> = {}
): MuiFieldRegistry {
  const components = new Map<string, MuiFieldComponent>(
    Object.entries(initial)
  );

  return {
    register(type, component) {
      components.set(type, component);
    },

    get(type) {
      return components.get(type);
    }
  };
}
