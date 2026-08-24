export type PermissionRole = 'admin' | 'editor' | 'viewer';
export type PermissionMode = 'editable' | 'read-only' | 'disabled' | 'hidden';
export type PermissionFieldName = 'displayName' | 'department' | 'salary' | 'adminNotes' | 'apiToken';
export interface PermissionPolicy { mode: PermissionMode; source: string; }

export const permissionLabels: Record<PermissionFieldName, string> = { displayName: 'Display name', department: 'Department', salary: 'Salary', adminNotes: 'Administrator notes', apiToken: 'API token' };
export const sensitivePermissionFields: ReadonlySet<PermissionFieldName> = new Set(['salary', 'apiToken']);
export const permissionSections: Record<string, readonly PermissionFieldName[]> = { profile: ['displayName', 'department'], compensation: ['salary'], administration: ['adminNotes', 'apiToken'] };
export const permissionInitialValues: Record<PermissionFieldName, string> = { displayName: 'Ada Lovelace', department: 'Engineering', salary: '150000', adminNotes: 'Executive access approved', apiToken: 'secret-production-token' };

export function resolvePermissionPolicy(role: PermissionRole, field: PermissionFieldName): PermissionPolicy {
  if (role === 'admin') return { mode: 'editable', source: 'RBAC role: admin' };
  if (role === 'editor') {
    if (field === 'adminNotes' || field === 'apiToken') return { mode: 'hidden', source: 'RBAC role: editor / administration section denied' };
    if (field === 'salary') return { mode: 'read-only', source: 'RBAC role: editor / compensation read grant' };
    if (field === 'department') return { mode: 'disabled', source: 'Tenant policy: department managed by HRIS' };
    return { mode: 'editable', source: 'RBAC role: editor' };
  }
  if (field === 'displayName' || field === 'department') return { mode: 'read-only', source: 'RBAC role: viewer / profile read grant' };
  return { mode: 'hidden', source: 'RBAC role: viewer / sensitive sections denied' };
}
export const resolvePermissionPolicies = (role: PermissionRole): Record<PermissionFieldName, PermissionPolicy> => Object.fromEntries((Object.keys(permissionLabels) as PermissionFieldName[]).map((field) => [field, resolvePermissionPolicy(role, field)])) as Record<PermissionFieldName, PermissionPolicy>;
export const redactPermissionValues = (values: Readonly<Record<PermissionFieldName, string>>): Record<PermissionFieldName, string> => Object.fromEntries((Object.entries(values) as [PermissionFieldName, string][]).map(([field, value]) => [field, sensitivePermissionFields.has(field) ? '[REDACTED]' : value])) as Record<PermissionFieldName, string>;