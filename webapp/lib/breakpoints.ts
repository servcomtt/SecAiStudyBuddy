/**
 * Layout breakpoints — keep in sync with `app/globals.css` @media queries.
 * Used by docs and Playwright projects (naming / boundary tests).
 */
export const BREAKPOINTS = {
  /** Single-column grids, stacked topbar, 2×2 mobile nav link grid */
  narrowPhone: 640,
  /** Sidebar → mobile toolbar + drawer; safe-area toolbar */
  mobileNav: 860,
  /** Multi-column grids collapse to 2 columns */
  twoColGrid: 1024,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;
