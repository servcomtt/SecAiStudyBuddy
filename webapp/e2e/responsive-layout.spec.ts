import { test, expect, devices } from '@playwright/test';

import { BREAKPOINTS } from '../lib/breakpoints';
import { chapters } from '../lib/course-data';

/**
 * Core learner surfaces — must not introduce horizontal scroll at any project viewport.
 * (WCAG 1.4.10 Reflow / usable reading width; multi-window resize on Android.)
 */
const ROUTES = ['/', '/dashboard', '/ai', '/domains', '/chapters/ch1/topics'] as const;

test.describe('responsive layout — no horizontal overflow', () => {
  for (const path of ROUTES) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        scrollWidth,
        `overflow on ${path}: scrollWidth=${scrollWidth} clientWidth=${clientWidth}`,
      ).toBeLessThanOrEqual(clientWidth + 2);
    });
  }
});

test.describe('breakpoint boundary — mobile shell', () => {
  test('859px: mobile menu control is visible; 961px: sidebar layout', async ({ browser }) => {
    test.skip(
      browser.browserType().name() !== 'chromium',
      'Desktop Chrome device emulation contexts require Chromium.',
    );
    /* Device projects (iPhone, etc.) set isMobile and skew layout; use a desktop context for CSS width checks. */
    const narrowCtx = await browser.newContext({
      ...devices['Desktop Chrome'],
      viewport: { width: 859, height: 900 },
    });
    const narrow = await narrowCtx.newPage();
    await narrow.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(
      narrow.getByRole('button', { name: 'Open full navigation including chapters' }),
    ).toBeVisible();
    await narrowCtx.close();

    const wideCtx = await browser.newContext({
      ...devices['Desktop Chrome'],
      viewport: { width: 961, height: 900 },
    });
    const wide = await wideCtx.newPage();
    await wide.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(wide.locator('.sidebar')).toBeVisible();
    await expect(
      wide.getByRole('button', { name: 'Open full navigation including chapters' }),
    ).toBeHidden();
    await wideCtx.close();
  });
});

test('mobile drawer opens and exposes chapter link (≤ mobileNav)', async ({ page }) => {
  const v = page.viewportSize();
  test.skip(!v || v.width > BREAKPOINTS.mobileNav, 'only for mobile shell viewports');
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  const menuBtn = page.getByRole('button', { name: 'Open full navigation including chapters' });
  await expect(menuBtn).toBeVisible();
  try {
    await menuBtn.tap({ timeout: 5_000 });
  } catch {
    await menuBtn.click();
  }
  await expect(page.locator('#mobile-nav-drawer')).toBeVisible();
  const ch1Drawer = page
    .locator('#mobile-nav-drawer .mobile-drawer__link--chapter')
    .filter({ hasText: /Ch\s*1/ })
    .filter({ hasText: new RegExp(chapters[0].title, 'i') });
  await expect(ch1Drawer).toBeVisible();
});
