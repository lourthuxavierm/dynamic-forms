import { expect, test } from 'playwright/test';

test('loads the documentation home and navigates to the React HTML integration', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Dynamic Forms documentation' })).toBeVisible();

  await page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Integrations' }).click();
  await page.getByLabel('Sidebar Navigation').getByRole('link', { name: 'React HTML', exact: true }).click();
  await expect(page).toHaveURL(/\/integrations\/react-html\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'React HTML integration' })).toBeVisible();
});

test('local search discovers source-verified documentation', async ({ page }) => {
  await page.goto('/');
  await page.locator('.VPNavBarSearch button').click();
  const search = page.locator('.VPLocalSearchBox input[type=search]');
  await search.fill('documentation standards');
  await expect(page.locator('.VPLocalSearchBox')).toContainText('Documentation standards');
});
