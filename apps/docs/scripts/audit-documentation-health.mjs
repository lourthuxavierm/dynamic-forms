import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const baselinePath = resolve(docsRoot, 'project/governance/health-baseline.json');
const failures = [];

if (!existsSync(baselinePath)) {
  console.error('Documentation health audit failed: health-baseline.json is missing.');
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
if (baseline.schemaVersion !== 1) failures.push(`unsupported baseline schemaVersion: ${baseline.schemaVersion}`);
if (!Array.isArray(baseline.areas) || baseline.areas.length < 8) failures.push('health baseline must cover at least 8 critical areas');

const now = new Date();
const ids = new Set();
const report = [];
for (const area of baseline.areas ?? []) {
  if (ids.has(area.id)) failures.push(`duplicate area id: ${area.id}`);
  ids.add(area.id);
  const path = resolve(docsRoot, area.source);
  if (!existsSync(path)) {
    failures.push(`${area.id}: source is missing (${area.source})`);
    continue;
  }

  const content = readFileSync(path, 'utf8');
  const owner = content.match(/^-?\s*Owner:\s*(.+)$/mi)?.[1]?.trim();
  const verified = content.match(/^-?\s*Last verified:\s*(\d{4}-\d{2}-\d{2})$/mi)?.[1];
  if (owner !== area.owner) failures.push(`${area.id}: owner metadata differs from baseline`);
  if (verified !== area.lastVerified) failures.push(`${area.id}: verification date differs from baseline`);

  const verifiedDate = new Date(`${area.lastVerified}T00:00:00Z`);
  const ageDays = Math.floor((now.getTime() - verifiedDate.getTime()) / 86_400_000);
  const maxAgeDays = area.maxAgeDays ?? baseline.defaultMaxAgeDays;
  if (!Number.isFinite(ageDays)) failures.push(`${area.id}: invalid lastVerified date`);
  else if (ageDays < -1) failures.push(`${area.id}: verification date is in the future`);
  else if (ageDays > maxAgeDays) failures.push(`${area.id}: stale by ${ageDays - maxAgeDays} day(s)`);
  report.push({ id: area.id, owner, lastVerified: verified, ageDays, maxAgeDays, status: ageDays <= maxAgeDays ? 'current' : 'stale' });
}

for (const file of [
  'project/governance/health.md',
  'project/governance/certification.md',
  'tests/documentation-health.spec.ts',
]) {
  if (!existsSync(resolve(docsRoot, file))) failures.push(`missing health artifact: ${file}`);
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ auditedAt: now.toISOString(), areas: report, failures }, null, 2));
} else {
  console.log(`Documentation health audit inspected ${report.length} critical areas; ${report.filter((item) => item.status === 'current').length} are current.`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Documentation health audit passed.');
