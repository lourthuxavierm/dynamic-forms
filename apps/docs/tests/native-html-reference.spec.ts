import { expect, test } from 'playwright/test';

test('Native HTML landing page states the architecture decision', async ({ page }) => {
  await page.goto('/integrations/native-html/');
  await expect(page.getByRole('heading', { level: 1, name: 'Standalone Native HTML/DOM' })).toBeVisible();
  await expect(page.getByText('There is currently no framework-independent renderer')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Not available; integration is Planned' })).toBeVisible();
});

test('installation page does not misrepresent the compatibility package', async ({ page }) => {
  await page.goto('/integrations/native-html/installation');
  await expect(page.getByText('There is nothing to install for standalone Native HTML/DOM today.')).toBeVisible();
  await expect(page.getByText('@dynamic-forms/html depends on @dynamic-forms/react-html')).toBeVisible();
  await expect(page.getByText('installing @dynamic-forms/html does not provide framework-free rendering')).toBeVisible();
});

test('complete example remains gated on implementation evidence', async ({ page }) => {
  await page.goto('/integrations/native-html/complete-example');
  await expect(page.getByRole('heading', { level: 1, name: 'Native HTML complete-example release gate' })).toBeVisible();
  await expect(page.getByText('There is no honest complete standalone Native HTML example to publish today.')).toBeVisible();
  await expect(page.getByText('CI must install, build, execute, and browser-test the example.')).toBeVisible();
});
