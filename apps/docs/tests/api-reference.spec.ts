import { expect, test } from 'playwright/test';

test('API overview separates generated signatures from handwritten guidance', async ({ page }) => {
  await page.goto('/api/');
  await expect(page.getByRole('heading', { level: 1, name: 'API reference' })).toBeVisible();
  await expect(page.getByRole('link', { name: '@dynamic-form-engine/core' })).toHaveAttribute('href', /generated\/core$/);
  await expect(page.getByText('Generated signatures do not replace task-oriented guides.')).toBeVisible();
});

test('generated Core API contains curated and source-derived entries', async ({ page }) => {
  await page.goto('/api/generated/core');
  await expect(page.getByRole('heading', { level: 1, name: '@dynamic-form-engine/core API' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'FormSchema' })).toBeVisible();
  await expect(page.getByText('Root declarative form contract.')).toBeVisible();
  await expect(page.getByText('Internal symbols: excluded')).toBeVisible();
});

test('generated API exposes explicit deprecation policy', async ({ page }) => {
  await page.goto('/api/generated/react');
  await expect(page.getByRole('heading', { level: 2, name: 'Deprecations' })).toBeVisible();
  await expect(page.getByText('replacement and removal target')).toBeVisible();
});

test('generated Zod API exposes Release-ready maturity and validator factories', async ({ page }) => {
  await page.goto('/api/generated/zod');
  await expect(page.getByRole('heading', { level: 1, name: '@dynamic-form-engine/zod API' })).toBeVisible();
  await expect(page.getByText('Maturity: Release-ready')).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'createZodFormValidator' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'createZodFieldValidator' })).toBeVisible();
});
