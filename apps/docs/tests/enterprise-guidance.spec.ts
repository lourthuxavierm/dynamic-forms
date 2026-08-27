import { expect, test } from 'playwright/test';

test('enterprise landing page gives architecture teams a complete review path', async ({ page }) => {
  await page.goto('/enterprise/');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Enterprise adoption guide' })).toBeVisible();
  await expect(article.getByRole('heading', { level: 2, name: 'Architecture review path' })).toBeVisible();
  await expect(article.getByRole('link', { name: 'adoption checklist', exact: true })).toHaveAttribute('href', /adoption-checklist$/);
  await expect(article.getByText('UI restrictions improve usability; they do not grant or revoke authority.')).toBeVisible();
});

test('security guidance keeps authority at the server boundary', async ({ page }) => {
  await page.goto('/enterprise/permissions');
  await expect(page.getByRole('heading', { level: 1, name: 'Permissions and read-only behavior' })).toBeVisible();
  await expect(page.getByText('They are not security controls.')).toBeVisible();
  await expect(page.getByText('explicit writable-field allowlist')).toBeVisible();
});

test('adoption checklist exposes reviewable enterprise controls', async ({ page }) => {
  await page.goto('/enterprise/adoption-checklist');
  await expect(page.getByRole('heading', { level: 2, name: 'Security and privacy' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Experience and accessibility' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Operations and delivery' })).toBeVisible();
  await expect(page.getByText(/Staged deployment, stop conditions, rollback, incident response/)).toBeVisible();
});
