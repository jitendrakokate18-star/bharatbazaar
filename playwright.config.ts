import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: { ...devices['Pixel 7'], browserName: 'chromium' },
    },
    {
      name: 'Mobile Safari (iPhone 13 Emulation)',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
    {
      name: 'Tablet Portrait (iPad Mini Emulation)',
      use: { ...devices['iPad Mini'], browserName: 'chromium' },
    },
    {
      name: 'Desktop Chrome',
      use: { viewport: { width: 1280, height: 800 }, browserName: 'chromium' },
    },
  ],
});
