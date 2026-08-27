import { expect, test } from 'playwright/test';

test('new users can compare documented and experimental integrations', async ({ page }) => {
  await page.goto('/getting-started/choose-an-integration');
  await expect(page.getByRole('heading', { level: 1, name: 'Choose an integration' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Documented and recommended' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Experimental 15-type baseline' })).toBeVisible();
  await expect(page.getByText('Choose React HTML for the complete documented renderer.')).toBeVisible();
});

test('first-form guidance places normal HTML submission on HtmlForm', async ({ page }) => {
  await page.goto('/getting-started/first-form');
  const example = page.locator('div[class*="language-tsx"]').filter({ hasText: 'Create employee' });
  await expect(example).toContainText('onSubmit');
  await expect(page.getByText("Provider onSubmit is used by the provider's programmatic submit() operation.")).toBeVisible();
});

test('the complete onboarding route exposes all eight steps', async ({ page }) => {
  await page.goto('/guides/');
  const journey = page.getByRole('heading', { level: 2, name: 'New-user journey' }).locator('xpath=following-sibling::ol[1]');
  await expect(journey.getByRole('listitem')).toHaveCount(8);
  await expect(journey.getByRole('link', { name: 'Handle submission' })).toHaveAttribute('href', /getting-started\/submission$/);
});
