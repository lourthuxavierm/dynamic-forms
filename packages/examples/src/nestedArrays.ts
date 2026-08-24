export type WorkerType = 'employee' | 'contractor';
export interface Skill { id: string; name: string; }
export interface Worker { id: string; name: string; type: WorkerType; endDate: string; skills: Skill[]; }
export interface PersonCompanyValues { name: string; address: { city: string; country: string }; company: { name: string }; }
export interface WorkerErrors { array: string; items: string[]; }
export interface ExampleIdentityFactory { next(prefix: string): string; }

export const createExampleIdentityFactory = (initial = 0): ExampleIdentityFactory => {
  let sequence = initial;
  return { next: (prefix) => `${prefix}-${++sequence}` };
};
export const createWorker = (identity: ExampleIdentityFactory, name = '', type: WorkerType = 'employee'): Worker => ({ id: identity.next('worker'), name, type, endDate: '', skills: [{ id: identity.next('skill'), name: 'TypeScript' }] });
export const createInitialPerson = (): PersonCompanyValues => ({ name: 'Ada Lovelace', address: { city: 'London', country: 'United Kingdom' }, company: { name: 'Analytical Engines' } });
export const validateWorkers = (workers: readonly Worker[], minItems = 1, maxItems = 5): WorkerErrors => ({
  array: workers.length < minItems ? `At least ${minItems === 1 ? 'one worker is' : `${minItems} workers are`} required.` : workers.length > maxItems ? `A maximum of ${maxItems} workers is allowed.` : '',
  items: workers.map((worker) => !worker.name.trim() ? `Worker ${worker.id} requires a name.` : worker.type === 'contractor' && !worker.endDate ? `${worker.name || worker.id} requires a contract end date.` : ''),
});
