import { expect, test } from 'playwright/test';

test('Zod compatibility remains explicit placeholder guidance', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Zod compatibility' })).toBeVisible();
  await expect(article.getByText('Do not import it for form validation yet.')).toBeVisible();
  await expect(article.getByText('Architecture approved; implementation Placeholder')).toBeVisible();
});

test('Zod policy exposes candidate majors without certifying them', async ({ page }) => {
  await page.goto('/project/zod-compatibility');
  const article = page.locator('main');
  await expect(article.getByText('^3.25.0', { exact: true })).toBeVisible();
  await expect(article.getByText('^4.0.0', { exact: true })).toBeVisible();
  await expect(article.getByText('Not certified', { exact: true }).first()).toBeVisible();
  await expect(article.getByText(/Do not silently apply Zod coercions, defaults, or transformed output/)).toBeVisible();
});
