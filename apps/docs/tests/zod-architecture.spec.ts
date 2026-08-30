import { expect, test } from 'playwright/test';

test('Zod compatibility presents form and field validation as Release-ready', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Zod compatibility' })).toBeVisible();
  await expect(article.getByText('Release-ready for the documented 0.1.x contract')).toBeVisible();
  await expect(article.getByText('createZodFormValidator', { exact: true }).first()).toBeVisible();
  await expect(article.getByText('createZodFieldValidator', { exact: true }).first()).toBeVisible();
  await expect(article.getByText(/The complete dual-major matrix is not available/)).toBeVisible();
});

test('Zod field validation documents its ownership and result boundaries', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 4 field validation' })).toBeVisible();
  await expect(article.getByText(/Issue paths are ignored because Core associates/)).toBeVisible();
  await expect(article.getByText(/Rules that compare multiple values belong/)).toBeVisible();
  await expect(article.getByText(/Successful transformed output is discarded/)).toBeVisible();
});

test('Zod form validation documents async, transform, and security boundaries', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 3 form validation' })).toBeVisible();
  await expect(article.getByText(/Successful Zod output is discarded/)).toBeVisible();
  await expect(article.getByText(/Concurrent calls share no mutable adapter state/)).toBeVisible();
  await expect(article.getByText(/not an authorization or security boundary/)).toBeVisible();
});

test('Zod issue mapping documents root, array, and multiple-error behavior', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 2 issue mapping' })).toBeVisible();
  await expect(article.getByText(/maps empty paths to/)).toBeVisible();
  await expect(article.getByText(/all.*joins every message in source order/)).toBeVisible();
});

test('Zod policy exposes the pinned dual-major matrix', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByText('^3.25.5', { exact: true })).toBeVisible();
  await expect(article.getByText('^4.0.0', { exact: true })).toBeVisible();
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 5 compatibility matrix' })).toBeVisible();
  await expect(article.getByText(/workflow tests four explicit cells/)).toBeVisible();
  await expect(article.getByText(/Do not silently apply Zod coercions, defaults, or transformed output/)).toBeVisible();
});

test('Zod integration guide exposes framework-specific handoff guidance', async ({ page }) => {
  await page.goto('/integrations/zod');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Zod validation' })).toBeVisible();
  await expect(article.getByText(/Use one Zod schema with the framework-independent/)).toBeVisible();
  await expect(article.getByRole('tab', { name: 'React HTML' })).toBeVisible();
  await expect(article.getByRole('tab', { name: 'Angular HTML' })).toBeVisible();
  await expect(article.getByRole('tab', { name: 'Native HTML' })).toBeVisible();
  await expect(article.getByRole('heading', { level: 2, name: 'Production checklist' })).toBeVisible();
});

test('Zod compatibility links to the generated API', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 7 generated API reference' })).toBeVisible();
  await expect(article.getByRole('link', { name: '@lourthuxavierm/dynamic-forms-zod API reference' })).toHaveAttribute('href', '/api/generated/zod');
});

test('Zod migration documents transformed output, stop conditions, and rollback', async ({ page }) => {
  await page.goto('/migration/zod-adapter');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Migrating to the Zod adapter' })).toBeVisible();
  await expect(article.getByRole('heading', { level: 2, name: 'Preserve transformed submission data' })).toBeVisible();
  await expect(article.getByText(/adapter does not migrate or rewrite persisted values/)).toBeVisible();
  await expect(article.getByRole('heading', { level: 2, name: 'Canary and stop conditions' })).toBeVisible();
  await expect(article.getByRole('heading', { level: 2, name: 'Rollback' })).toBeVisible();
});

test('Zod release verifier documents artifact and matrix gates', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 9 release verifier' })).toBeVisible();
  await expect(article.getByText('pnpm verify:zod-release', { exact: true }).first()).toBeVisible();
  await expect(article.getByText(/release-gate job depends on all four pinned/)).toBeVisible();
  await expect(article.getByText(/rejects leaked source or tests and unresolved/)).toBeVisible();
});

test('Zod compatibility documents the shared renderer playground hook', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 10 renderer playground integration' })).toBeVisible();
  await expect(article.getByText(/accept an optional.*formValidator/)).toBeVisible();
  await expect(article.getByText(/shared.*zod-validation.*catalogue route/)).toBeVisible();
});

test('Zod integration renders deterministic visual evidence', async ({ page }) => {
  await page.goto('/integrations/zod');
  await expect(page.getByRole('img', { name: 'Zod validation example with mapped field errors' })).toBeVisible();
});
