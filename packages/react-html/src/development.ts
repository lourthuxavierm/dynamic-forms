export function warnInHtmlDevelopment(message: string): void {
  const runtime = globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV === 'production') return;
  console.warn('[dynamic-forms/html] ' + message);
}
