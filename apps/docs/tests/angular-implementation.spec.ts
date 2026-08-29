import { expect, test } from 'playwright/test';

test('Angular HTML consumes the shared basic example contract', async ({ page }) => {
  await page.goto('http://127.0.0.1:4176/?example=basic-form');
  await expect(page.getByRole('heading', { level: 1, name: 'Angular HTML shared example' })).toBeVisible();
  await expect(page.getByText('Basic form', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByLabel('Work email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit Basic form' })).toBeVisible();
});

test('Angular HTML validates and submits shared Core values', async ({ page }) => {
  await page.goto('http://127.0.0.1:4176/?example=core-controls');
  await expect(page.getByText('Core controls', { exact: true })).toBeVisible();
  await page.getByLabel('Title').fill('Platform profile');
  await page.getByLabel('Role').selectOption('architect');
  await page.getByRole('button', { name: 'Submit Core controls' }).click();
  const output = page.getByRole('complementary');
  await expect(output).toContainText('Platform profile');
  await expect(output).toContainText('architect');
});

test('Angular HTML falls back when an example is not advertised for it', async ({ page }) => {
  await page.goto('http://127.0.0.1:4176/?example=file-media');
  await expect(page.getByText('Basic form', { exact: true })).toBeVisible();
});

test('Angular HTML runs the shared Zod form validator before emitting submission', async ({ page }) => {
  await page.goto('http://127.0.0.1:4176/?example=zod-validation');
  await page.getByRole('button', { name: 'Submit Zod validation' }).click();
  await expect(page.getByText('Enter a valid work email')).toBeVisible();
  await expect(page.getByText('Use at least eight characters')).toBeVisible();
  await expect(page.getByRole('complementary')).toContainText('Submit a valid form.');
  await page.getByLabel('Work email').fill('engineer@example.com');
  await page.getByLabel('Password', { exact: true }).fill('secure-pass');
  await page.getByLabel('Confirm password').fill('secure-pass');
  await page.getByRole('button', { name: 'Submit Zod validation' }).click();
  await expect(page.getByRole('complementary')).toContainText('engineer@example.com');
});
