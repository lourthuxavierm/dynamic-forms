import type { FormSchema } from '@lourthuxavierm/dynamic-forms-core';
const KEY = 'dynamic-forms:builder:draft';
interface Draft { version: 1; schema: FormSchema; selectedPath?: string; updatedAt: string }
export const starterSchema: FormSchema = { id: 'customer-intake', version: '1.0.0', fields: [
  { name: 'fullName', type: 'text', label: 'Full name', placeholder: 'Ada Lovelace', validation: { required: true } },
  { name: 'email', type: 'email', label: 'Work email', placeholder: 'ada@example.com', validation: { required: true } },
  { name: 'requestType', type: 'select', label: 'How can we help?', options: [{ label: 'Product question', value: 'product' }, { label: 'Support', value: 'support' }] },
] };
export function loadDraft(): { schema: FormSchema; selectedPath?: string } {
  try { const draft = JSON.parse(localStorage.getItem(KEY) ?? '') as Draft; if (draft.version === 1 && draft.schema?.fields) return draft; } catch { /* recover with starter */ }
  return { schema: starterSchema, selectedPath: starterSchema.fields[0]?.name };
}
export function saveDraft(schema: FormSchema, selectedPath?: string): void { const draft: Draft = { version: 1, schema, selectedPath, updatedAt: new Date().toISOString() }; localStorage.setItem(KEY, JSON.stringify(draft)); }
export function clearDraft(): void { localStorage.removeItem(KEY); }
