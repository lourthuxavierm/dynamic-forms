import { expect, test } from 'playwright/test';

const viewports = [
  { name: 'desktop', width: 1536, height: 1024 },
  { name: 'tablet', width: 900, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
  test(`captures the ${viewport.name} builder baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page).toHaveScreenshot(`builder-${viewport.name}.png`, {
      animations: 'disabled',
      fullPage: true,
    });
  });
}
