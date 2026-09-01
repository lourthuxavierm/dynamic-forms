export function warnRHF(message: string): void {
  const environment = (globalThis as {
    process?: { env?: { NODE_ENV?: string } };
  }).process?.env?.NODE_ENV;
  if (environment !== 'production') console.warn('[dynamic-forms/rhf] ' + message);
}
