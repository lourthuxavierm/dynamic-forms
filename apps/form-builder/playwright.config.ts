import { defineConfig } from 'playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: true, forbidOnly: Boolean(process.env.CI), retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: { baseURL: 'http://127.0.0.1:4177', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: { command: 'pnpm dev --host 127.0.0.1 --port 4177', url: 'http://127.0.0.1:4177', reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
