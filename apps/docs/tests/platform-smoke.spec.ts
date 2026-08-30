import { expect, test } from 'playwright/test';

test('renders documentation platform components with current framework status', async ({ page }) => {
  await page.goto('/project/platform-components');
  await expect(page.getByRole('heading', { level: 1, name: 'Documentation platform components' })).toBeVisible();
  await expect(page.getByText('Implemented', { exact: true })).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: 'Available' })).toHaveCount(3);
  await expect(page.getByRole('definition').filter({ hasText: 'Experimental' })).toHaveCount(2);
});

test('framework tabs expose Angular HTML experimental status', async ({ page }) => {
  await page.goto('/project/platform-components');
  const tablist = page.getByRole('tablist', { name: 'Framework examples' });
  await expect(tablist).toBeVisible();
  await page.getByRole('tab', { name: 'Angular HTML' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Experimental Angular 22 renderer');
});

test('installation tabs switch package managers without changing package scope', async ({ page }) => {
  await page.goto('/project/platform-components');
  await page.getByRole('tablist', { name: 'Package manager' }).getByRole('tab', { name: 'npm', exact: true }).click();
  await expect(page.getByText('npm install @lourthuxavierm/dynamic-forms-core @lourthuxavierm/dynamic-forms-react @lourthuxavierm/dynamic-forms-react-html react react-dom')).toBeVisible();
});

test('component fixture has no horizontal page overflow at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/project/platform-components');
  const dimensions = await page.locator('html').evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});
