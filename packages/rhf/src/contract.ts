/** Defines how a conditionally hidden field participates in RHF state. */
export type RHFHiddenFieldPolicy = 'retain' | 'unregister';

/** Stable ownership boundary for the React Hook Form adapter. */
export interface RHFAdapterContract {
  readonly stateOwner: 'react-hook-form';
  readonly schemaOwner: '@dynamic-form-engine/core';
  readonly renderer: 'consumer';
  readonly defaultHiddenFieldPolicy: RHFHiddenFieldPolicy;
}

/**
 * Public ownership contract used by documentation, diagnostics, and consumers.
 * Runtime field synchronization is introduced in Phase 1.
 */
export const RHF_ADAPTER_CONTRACT: Readonly<RHFAdapterContract> = Object.freeze({
  stateOwner: 'react-hook-form',
  schemaOwner: '@dynamic-form-engine/core',
  renderer: 'consumer',
  defaultHiddenFieldPolicy: 'retain',
});
