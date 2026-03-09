import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  timeout: 60000,
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'on',
    video: {
      mode: 'on',
    }
  },
  projects: [
    {
      name: 'main',
      testIgnore: /photos-cache/,
    },
    {
      name: 'cache',
      testMatch: /photos-cache/,
      dependencies: ['main'],
    },
  ],
});