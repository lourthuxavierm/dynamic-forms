import { expect, test } from 'playwright/test';

test('loads the documentation home and navigates to the control inventory', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Dynamic Forms documentation' })).toBeVisible();

  await page.getByRole('link', { name: 'MUI control inventory' }).first().click();
  await expect(page).toHaveURL(/\/CONTROL$/);
  await expect(page.getByRole('heading', { level: 1, name: 'MUI control inventory' })).toBeVisible();
  await expect(page.getByText('Total: 42 registered field types.')).toBeVisible();
});

test('local search discovers source-verified documentation', async ({ page }) => {
  await page.goto('/');
  await page.locator('.VPNavBarSearch button').click();
  const search = page.locator('.VPLocalSearchBox input[type="search"]');
  await search.fill('documentation standards');
  await expect(page.locator('.VPLocalSearchBox')).toContainText('Documentation standards');
});

test('quickstart validates, reports errors, and submits values', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/?example=quickstart');
  await expect(page.getByRole('heading', { level: 1, name: 'Create your profile' })).toBeVisible();

  await page.getByRole('button', { name: 'Create profile' }).click();
  await expect(page.getByText('Full name is required')).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeFocused();

  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Work email').fill('ada@example.com');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Developer' }).click();
  await page.getByRole('button', { name: 'Create profile' }).click();

  await expect(page.getByTestId('submission-result')).toContainText(
    'Profile created for Ada Lovelace (ada@example.com).',
  );
});
test('playground shell supports navigation, search, and theme controls', async ({ page }) => {
  await page.goto('http://127.0.0.1:4175/');
  await expect(page.getByRole('heading', { level: 1, name: 'Enterprise playground' })).toBeVisible();
  await page.getByRole('button', { name: 'Basic form' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4175/basic-form');
  await expect(page.getByRole('heading', { level: 1, name: 'Basic form' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit demo' }).click();
  await expect(page.getByText('Full name is required', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Schema editor' }).click();
  await page.getByLabel('Schema JSON').fill('{ invalid json');
  await page.getByRole('button', { name: 'Apply schema' }).click();
  await expect(page.getByRole('alert')).toContainText('JSON');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await page.getByLabel('Search demos').fill('validation');
  await expect(page.getByRole('button', { name: 'Validation' })).toBeVisible();
});