import { expect, test } from 'playwright/test';

test('support landing page routes incidents to searchable guidance', async ({ page }) => {
  await page.goto('/support/');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Operational support' })).toBeVisible();
  await expect(article.getByRole('link', { name: 'Error and symptom index' })).toHaveAttribute('href', /error-index$/);
  await expect(article.getByText(/Do not place secrets, access tokens, uploaded files/)).toBeVisible();
});

test('troubleshooting uses diagnostic structure and exact error search terms', async ({ page }) => {
  await page.goto('/support/troubleshooting/');
  await expect(page.getByRole('heading', { level: 2, name: 'Hydration mismatch' })).toBeVisible();
  await expect(page.getByText('Likely cause:', { exact: true }).first()).toBeVisible();
  await page.goto('/support/troubleshooting/error-index');
  await expect(page.getByText('Hydration failed', { exact: true })).toBeVisible();
  await expect(page.getByText('Unknown field type', { exact: true })).toBeVisible();
});

test('migration path includes release rollback protection', async ({ page }) => {
  await page.goto('/migration/');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Migration guides' })).toBeVisible();
  await expect(article.getByRole('link', { name: 'Schema versions', exact: true })).toBeVisible();
  await page.goto('/support/release-readiness');
  await expect(page.getByRole('heading', { level: 2, name: 'Rollback contract' })).toBeVisible();
  await expect(page.getByText(/a package downgrade alone is not a rollback/)).toBeVisible();
});
