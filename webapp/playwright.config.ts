import { defineConfig, devices } from '@playwright/test';

/**
 * Device profiles approximate:
 * - Apple HIG: iPhone / iPad sizes, portrait + landscape
 * - Android large-screen: Pixel phone + tablet-class widths, resize boundaries
 * CI runs Chromium only; local runs the same matrix (install browsers via `npx playwright install`).
 *
 * Preview deployments: set PLAYWRIGHT_PREVIEW_URL (e.g. Vercel preview) — webServer is disabled
 * and all tests hit that origin (GitHub Actions after `vercel deploy`).
 */
const previewURL = process.env.PLAYWRIGHT_PREVIEW_URL?.trim();
const usePreviewHost = Boolean(previewURL);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL:
      previewURL ||
      process.env.PLAYWRIGHT_BASE_URL?.trim() ||
      'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: usePreviewHost
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        cwd: __dirname,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    /* Apple-sized viewports on Chromium so CI only needs `playwright install chromium` (HIG-style metrics). */
    {
      name: 'iphone-14',
      use: {
        browserName: 'chromium',
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'iphone-14-landscape',
      use: {
        browserName: 'chromium',
        ...devices['iPhone 14 landscape'],
      },
    },
    {
      name: 'ipad-pro-11',
      use: {
        browserName: 'chromium',
        ...devices['iPad Pro 11'],
      },
    },
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'pixel-7-landscape',
      use: { ...devices['Pixel 7 landscape'] },
    },
    /* Just below globals.css mobile-nav breakpoint (860px): shell should use drawer + strip */
    {
      name: 'width-859-mobile-shell',
      use: {
        browserName: 'chromium',
        viewport: { width: 859, height: 900 },
        userAgent: devices['Pixel 7'].userAgent,
        isMobile: true,
        hasTouch: true,
      },
    },
    /* Just above mobile-nav: sidebar layout */
    {
      name: 'width-861-sidebar',
      use: {
        browserName: 'chromium',
        viewport: { width: 961, height: 900 },
      },
    },
    /* Small Android phone width */
    {
      name: 'galaxy-s8',
      use: { ...devices['Galaxy S8'] },
    },
  ],
});
