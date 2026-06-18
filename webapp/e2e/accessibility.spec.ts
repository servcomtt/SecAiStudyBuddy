import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

/**
 * Automated WCAG 2.2 baseline (Level A + AA tags axe supports).
 * Manual testing still required for cognitive, timing, and some 2.5.x scenarios.
 */
const AXE_ROUTES = ['/dashboard', '/chapters/ch1/topics', '/ai'] as const;

test.describe('axe — WCAG 2.2 AA tags', () => {
  for (const path of AXE_ROUTES) {
    test(`${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();

      expect(
        results.violations,
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
            help: v.help,
          })),
          null,
          2,
        ),
      ).toEqual([]);
    });
  }
});
