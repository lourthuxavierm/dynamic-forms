import { expect, test } from 'playwright/test';

test('Angular HTML playground renders the experimental zoneless form', async ({ page }) => {
  await page.goto('http://127.0.0.1:4176');
  await expect(page.getByRole('heading', { level: 1, name: 'Angular HTML experimental playground' })).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create profile' })).toBeVisible();
});

test('Angular HTML playground validates and emits submitted Core values', async ({ page }) => {
  await page.goto('http://127.0.0.1:4176');
  await page.getByRole('button', { name: 'Create profile' }).click();
  await expect(page.getByText('Full name is required')).toBeVisible();
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.test');
  await page.getByLabel('Role').selectOption('architect');
  await page.getByRole('button', { name: 'Create profile' }).click();
  const output = page.getByRole('complementary');
  await expect(output).toContainText('Ada Lovelace');
  await expect(output).toContainText('ada@example.test');
  await expect(output).toContainText('architect');
});
