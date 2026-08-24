import { expect, test } from 'playwright/test';

test('loads the documentation home and navigates to the HTML package', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Dynamic Forms documentation' })).toBeVisible();

  await page.getByRole('link', { name: 'HTML' }).first().click();
  await expect(page).toHaveURL(/\/packages\/html$/);
  await expect(page.getByRole('heading', { level: 1, name: '@dynamic-forms/html' })).toBeVisible();
});

test('local search discovers source-verified documentation', async ({ page }) => {
  await page.goto('/');
  await page.locator('.VPNavBarSearch button').click();
  const search = page.locator('.VPLocalSearchBox input[type=search]');
  await search.fill('documentation standards');
  await expect(page.locator('.VPLocalSearchBox')).toContainText('Documentation standards');
});
