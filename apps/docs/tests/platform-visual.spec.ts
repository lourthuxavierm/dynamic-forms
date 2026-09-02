import { expect, test } from 'playwright/test';

test('documentation platform component fixture matches its visual baseline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/project/platform-components');
  await page.getByRole('heading', { level: 1, name: 'Documentation platform components' }).waitFor();
  await expect(page).toHaveScreenshot('documentation-platform-components.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.02,
    timeout: 10_000,
  });
});
