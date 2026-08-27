import { expect, test } from 'playwright/test';

test('governance overview exposes enforcement and local commands', async ({ page }) => {
  await page.goto('/project/governance/');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 1, name: 'Documentation governance' })).toBeVisible();
  await expect(article.getByText('Diff-aware policy')).toBeVisible();
  await expect(article.locator('pre').getByText('pnpm docs:governance', { exact: true })).toBeVisible();
});

test('change-impact policy maps source changes to companions', async ({ page }) => {
  await page.goto('/project/governance/change-impact');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Required companions' })).toBeVisible();
  await expect(article.getByText('Core schema implementation', { exact: true })).toBeVisible();
  await expect(article.getByText('Migration guide', { exact: true })).toBeVisible();
});

test('release audit covers migrations, rollback, and support ownership', async ({ page }) => {
  await page.goto('/project/governance/release-audit');
  const article = page.locator('main');
  await expect(article.getByRole('heading', { level: 2, name: 'Adoption and migration' })).toBeVisible();
  await expect(article.getByText(/Rollout stop conditions and rollback or forward-fix/)).toBeVisible();
  await expect(article.getByText(/Documentation and package owners approved/)).toBeVisible();
});
