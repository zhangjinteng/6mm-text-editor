import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Keep archived runs intact when Playwright clears its output directory.
  outputDir: './test-results/latest',
  timeout: 90000,
  expect: { timeout: 20000 },
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5184', channel: 'chrome', trace: 'retain-on-failure' },
  webServer: { command: 'pnpm dev --port 5184 --strictPort', url: 'http://localhost:5184', reuseExistingServer: true },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } }]
});
