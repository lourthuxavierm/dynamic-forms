import { expect, test } from 'playwright/test';

test('React landing page separates headless and rendered responsibilities', async ({ page }) => {
  await page.goto('/integrations/react/');
  await expect(page.getByRole('heading', { level: 1, name: 'React integration' })).toBeVisible();
  await expect(page.getByText('It does not ship browser controls or visual styling.')).toBeVisible();
  await expect(page.locator('#VPContent').getByRole('link', { name: 'React HTML', exact: true })).toBeVisible();
});

test('React hooks page exposes focused subscription guidance', async ({ page }) => {
  await page.goto('/integrations/react/hooks');
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(12);
  await expect(page.getByText('Hooks use useSyncExternalStore')).toBeVisible();
});

test('HtmlForm page states the provider submission boundary', async ({ page }) => {
  await page.goto('/integrations/react-html/html-form');
  await expect(page.getByRole('heading', { level: 1, name: 'HtmlForm' })).toBeVisible();
  await expect(page.getByText('does not call FormProvider.submit()')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'registry, arrayItemsRenderer' })).toBeVisible();
});

test('deep-reference catalogue exposes every package-local document', async ({ page }) => {
  await page.goto('/integrations/react-html/deep-references');
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(14);
  await expect(table.getByRole('cell', { name: 'MIGRATION-FROM-HTML.md' })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'accessibility-verification.md' })).toBeVisible();
});

test('performance page exposes enforced budgets', async ({ page }) => {
  await page.goto('/integrations/react-html/performance');
  await expect(page.getByText('below 10 KB for the core entry')).toBeVisible();
  await expect(page.getByText('16-millisecond synthetic keystroke budget')).toBeVisible();
});
