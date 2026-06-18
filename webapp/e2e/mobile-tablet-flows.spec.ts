import { test, expect } from '@playwright/test';

import { BREAKPOINTS } from '../lib/breakpoints';

/** Phone + tablet tiers where we assert modal + touch-critical flows */
const MODAL_VIEWPORT_PROJECTS = new Set([
  'pixel-7',
  'pixel-7-landscape',
  'iphone-14',
  'iphone-14-landscape',
  'galaxy-s8',
  'ipad-pro-11',
]);

const TABLET_MULTI_COLUMN_PROJECTS = new Set(['ipad-pro-11', 'width-861-sidebar']);

test.describe('Study Buddy modal — fit, overflow, dismiss', () => {
  test('dialog stays within viewport; Escape closes', async ({ page }) => {
    test.skip(
      !MODAL_VIEWPORT_PROJECTS.has(test.info().project.name),
      'Modal matrix: phone + tablet tiers',
    );
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

    const fab = page.getByRole('button', { name: 'Ask Your Study Buddy' });
    try {
      await fab.tap({ timeout: 5_000 });
    } catch {
      await fab.click();
    }

    const dialog = page.getByRole('dialog', { name: /Ask Your Study Buddy/i });
    await expect(dialog).toBeVisible();

    const box = await dialog.boundingBox();
    expect(box, 'dialog bounding box').not.toBeNull();
    const { width: vw, height: vh } = page.viewportSize()!;
    expect(box!.width).toBeLessThanOrEqual(vw + 2);
    expect(box!.height).toBeLessThanOrEqual(vh + 2);
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.y).toBeGreaterThanOrEqual(-1);

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('short viewport: modal still fits (keyboard overlap proxy)', async ({ page }) => {
    test.skip(
      test.info().project.name !== 'pixel-7',
      'one representative phone project',
    );
    await page.setViewportSize({ width: 390, height: 480 });
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Ask Your Study Buddy' }).click();
    const dialog = page.getByRole('dialog', { name: /Ask Your Study Buddy/i });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    const vh = page.viewportSize()!.height;
    expect(box!.y + box!.height).toBeLessThanOrEqual(vh + 2);
  });
});

test.describe('mobile navigation — drawer', () => {
  test('drawer link navigates to AI Chat', async ({ page }) => {
    const v = page.viewportSize();
    test.skip(!v || v.width > BREAKPOINTS.mobileNav, 'mobile shell only');
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open full navigation including chapters' }).click();
    await page.locator('#mobile-nav-drawer').getByRole('link', { name: 'AI Chat' }).click();
    await expect(page).toHaveURL(/\/ai$/);
  });
});

test.describe('tablet / wide — multi-column layout', () => {
  test('dashboard chapter grid has ≥2 columns', async ({ page }) => {
    test.skip(
      !TABLET_MULTI_COLUMN_PROJECTS.has(test.info().project.name),
      'tablet + sidebar-tier widths',
    );
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    const colCount = await page.$eval('.chapter-grid', (el) => {
      const raw = getComputedStyle(el).gridTemplateColumns;
      return raw.split(/(?<=[frpx%])\s+/).filter((s) => s.trim().length > 0).length;
    });
    expect(colCount, 'gridTemplateColumns tracks').toBeGreaterThanOrEqual(2);
  });
});

test.describe('touch targets — primary mobile controls', () => {
  test('menu FAB meets minimum size (44×44 CSS px class)', async ({ page }) => {
    const v = page.viewportSize();
    test.skip(!v || v.width > BREAKPOINTS.mobileNav);
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    const menu = page.getByRole('button', { name: 'Open full navigation including chapters' });
    const b = await menu.boundingBox();
    expect(b).not.toBeNull();
    expect(b!.height, 'menu button height').toBeGreaterThanOrEqual(43);
    expect(b!.width, 'menu button width').toBeGreaterThanOrEqual(43);
  });
});
