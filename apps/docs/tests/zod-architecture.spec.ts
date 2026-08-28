import { expect, test } from 'playwright/test';

test('Zod compatibility presents form validation as Experimental', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Zod compatibility' })).toBeVisible();
  await expect(article.getByText('Form validation Experimental')).toBeVisible();
  await expect(article.getByText('createZodFormValidator', { exact: true }).first()).toBeVisible();
  await expect(article.getByText(/Field-level validation and the complete dual-major matrix are not available/)).toBeVisible();
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

test('Zod policy exposes candidate majors without certifying them', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByText('^3.25.0', { exact: true })).toBeVisible();
  await expect(article.getByText('^4.0.0', { exact: true })).toBeVisible();
  await expect(article.getByText('Not certified', { exact: true }).first()).toBeVisible();
  await expect(article.getByText(/Do not silently apply Zod coercions, defaults, or transformed output/)).toBeVisible();
});
