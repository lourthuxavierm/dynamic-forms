import { DependencyGraph } from '@dynamic-forms/core';
export type LocationField = 'country' | 'state' | 'city';
export type ValuePolicy = 'clear' | 'preserve';
export interface LocationOption { label: string; value: string; }
export const countries: LocationOption[] = [{ label: 'India', value: 'IN' }, { label: 'United States', value: 'US' }];
export const states: Record<string, LocationOption[]> = { IN: [{ label: 'Tamil Nadu', value: 'TN' }, { label: 'Karnataka', value: 'KA' }], US: [{ label: 'California', value: 'CA' }, { label: 'New York', value: 'NY' }] };
export const cities: Record<string, LocationOption[]> = { TN: [{ label: 'Chennai', value: 'Chennai' }, { label: 'Coimbatore', value: 'Coimbatore' }], KA: [{ label: 'Bengaluru', value: 'Bengaluru' }], CA: [{ label: 'San Francisco', value: 'San Francisco' }, { label: 'San Diego', value: 'San Diego' }], NY: [{ label: 'New York City', value: 'New York City' }] };
export const dependencyGraph = new DependencyGraph([{ field: 'state', dependsOn: ['country'] }, { field: 'city', dependsOn: ['state'] }]);
export const dependencySource = `const graph = new DependencyGraph([\n  { field: 'state', dependsOn: ['country'] },\n  { field: 'city', dependsOn: ['state'] },\n]);\ngraph.getTransitiveDependents('country'); // ['state', 'city']`;
