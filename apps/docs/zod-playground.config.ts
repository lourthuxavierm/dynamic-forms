import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['example-catalogue.spec.ts', 'angular-implementation.spec.ts'],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  projects: [{ name: 'chromium', use: { browserName: 'chromium', trace: 'on-first-retry' } }],
  webServer: [
    {
      command: 'pnpm --filter @dynamic-forms/react-html-playground dev --host 127.0.0.1 --port 4175',
      url: 'http://127.0.0.1:4175/?example=zod-validation',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @dynamic-forms/angular-html-playground dev --host 127.0.0.1 --port 4176',
      url: 'http://127.0.0.1:4176/?example=zod-validation',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
