import { expect, test } from 'playwright/test';

test('health dashboard explains executable freshness enforcement', async ({ page }) => {
  await page.goto('/project/governance/health');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Documentation health dashboard' })).toBeVisible();
  await expect(article.getByRole('heading', { level: 2, name: 'Failure conditions' })).toBeVisible();
  await expect(article.getByText(/monthly at 03:17 UTC on the first day/)).toBeVisible();
});

test('certification preserves package maturity boundaries', async ({ page }) => {
  await page.goto('/project/governance/certification');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Documentation certification record' })).toBeVisible();
  await expect(article.getByText(/does not promote Experimental Angular packages or Planned Native HTML/)).toBeVisible();
  await expect(article.getByRole('link', { name: 'feature maturity' })).toHaveAttribute('href', /feature-maturity$/);
});
