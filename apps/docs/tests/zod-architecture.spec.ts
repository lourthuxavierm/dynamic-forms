import { expect, test } from 'playwright/test';

test('Zod compatibility distinguishes issue mapping from usable validation', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Zod compatibility' })).toBeVisible();
  await expect(article.getByText('Do not use it as an application validator.')).toBeVisible();
  await expect(article.getByText('Issue mapping implemented; validation Placeholder')).toBeVisible();
  await expect(article.getByText('Validator factories remain intentionally unavailable.')).toBeVisible();
});

test('Zod issue mapping documents root, array, and multiple-error behavior', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Phase 2 issue mapping' })).toBeVisible();
  await expect(article.getByText(/maps empty paths to/)).toBeVisible();
  await expect(article.getByText(/all.*joins every message in source order/)).toBeVisible();
});

test('Zod policy exposes candidate majors without certifying them', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByText('^3.25.0', { exact: true })).toBeVisible();
  await expect(article.getByText('^4.0.0', { exact: true })).toBeVisible();
  await expect(article.getByText('Not certified', { exact: true }).first()).toBeVisible();
  await expect(article.getByText(/Do not silently apply Zod coercions, defaults, or transformed output/)).toBeVisible();
});
