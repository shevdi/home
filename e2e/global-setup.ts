import { chromium } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function globalSetup() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="username"]', { timeout: 120_000 });
  } finally {
    await browser.close();
  }
}

export default globalSetup;
