# Mobile & tablet view — optimization, test, and integration

The application uses a **single responsive web codebase** optimized for **iPhone, iPad, Android phones, and Android tablets**. Layout behavior is validated across **phone and tablet viewport tiers**, including **portrait and landscape**.

## Goals (summary)

| Area | Approach |
|------|----------|
| **Responsive rendering** | CSS tiers at 640 / 860 / 1024px (`lib/breakpoints.ts` + `globals.css`); Playwright overflow checks on core routes |
| **Touch** | Device descriptors with `hasTouch`; FAB uses **tap** when touch is enabled |
| **Navigation** | Mobile strip + drawer; E2E: open drawer → **AI Chat** route |
| **Keyboard overlap** | Short viewport (390×480) test keeps **Study Buddy** dialog within viewport; **manual** check on real devices with software keyboard |
| **Modal / dialog fit** | E2E: FAB → dialog visible, bounding box inside viewport, `Escape` closes, no horizontal overflow |
| **Multi-column (tablet)** | E2E: **iPad Pro 11** + 861px-wide project expect **≥2** `chapter-grid` columns |
| **WCAG 2.2 AA** | **axe** with `wcag2a`, `wcag2aa`, `wcag22aa` on `/dashboard`, `/chapters/ch1/topics`, `/ai` |
| **Browsers** | **Automated:** Chromium + Apple **sized** emulation (CI-friendly). **Manual / release:** **Safari** on iPhone & iPad, **Chrome** on Android phone & tablet (emulator + physical) |
| **Preview deployments** | `PLAYWRIGHT_PREVIEW_URL` disables local `webServer`; **Vercel PR workflow** waits for HTTP then runs the **same** Playwright matrix against the preview URL |

## 1. Breakpoints (single source of truth)

| Token | Width | CSS (`globals.css`) | Behavior |
|-------|------:|---------------------|----------|
| `narrowPhone` | **640px** | `@media (max-width: 640px)` | Single-column grids; topbar stacks; mobile nav 2×2 link grid |
| `mobileNav` | **860px** | `@media (max-width: 860px)` | Sidebar hidden; fixed strip + drawer; `env(safe-area-inset-*)` |
| `twoColGrid` | **1024px** | `@media (max-width: 1024px)` | Chapter/stat grids → 2 columns |

Constants: `webapp/lib/breakpoints.ts`.

## 2. Automated Playwright (`e2e/` + `playwright.config.ts`)

### Device matrix (Chromium)

iPhone / iPad projects set **`browserName: 'chromium'`** with Playwright **device** options (viewport, DPR, UA, touch) so CI only installs **Chromium**. For **pixel-accurate Safari**, run **`npx playwright install webkit`** locally and adjust project `browserName` when needed.

- **Desktop** 1280×720  
- **iPhone 14** portrait & landscape  
- **iPad Pro 11**  
- **Pixel 7** portrait & landscape  
- **859×900** / **961×900** (straddle `mobileNav`)  
- **Galaxy S8** (360-class width)

### Suites

| File | Coverage |
|------|----------|
| `responsive-layout.spec.ts` | No horizontal overflow on key routes; 859/861 shell vs sidebar; drawer shows Ch 1 |
| `accessibility.spec.ts` | axe WCAG 2.2 AA-tagged rules |
| `mobile-tablet-flows.spec.ts` | Study Buddy **modal** fit + **Escape**; **short viewport** modal; **drawer → /ai**; **tablet ≥2 columns**; **touch target** size on menu button (mobile) |

### Commands

**Local (production build + `next start`):**

```bash
npm --prefix webapp ci
npm --prefix webapp run build
npx --prefix webapp playwright install chromium
npm run web:test:e2e
```

**Preview URL (no local server):**

```bash
export PLAYWRIGHT_PREVIEW_URL="https://your-app-git-branch.vercel.app"
npm --prefix webapp ci
npx --prefix webapp playwright install chromium
npm --prefix webapp run test:e2e:preview
```

(`test:e2e:preview` is the same runner; the env var switches `baseURL` and disables `webServer`.)

## 3. Release approval — critical flows (must pass)

Automated checks below are **required** for merge/release; they assert **no clipping**, **no horizontal overflow**, and **no broken navigation** on the matrix above.

| Flow | Automated |
|------|-----------|
| Load dashboard, AI, domains, chapter topics | Overflow + axe (where applicable) |
| Mobile: open **full navigation** drawer | Visible + Ch 1 link |
| Mobile: drawer → **AI Chat** | URL `/ai` |
| **Study Buddy** FAB → modal | In viewport; Escape closes |
| Short height viewport + modal | Modal bottom ≤ viewport (keyboard-overlap proxy) |
| Tablet / 861px width | Chapter grid **≥2 columns** |
| Mobile menu control | Bounding box **≥43px** (44px-class target) |

**Manual (before major release or App Store–class cut):**

- **Safari** iPhone/iPad: software keyboard over chat fields, scroll containment in modal, VoiceOver order  
- **Chrome** Android: multi-window resize, TalkBack on drawer links  
- **Landscape** on real devices for quiz + AI screens  

## 4. CI wiring

| Workflow | When | What |
|----------|------|------|
| **`ci.yml` → webapp job** | PR / push | `build` + Playwright vs **`next start`** (localhost) |
| **`deploy-vercel.yml` → preview** | PR (non-fork) | After `vercel deploy`, **curl wait** on `/dashboard`, then **`PLAYWRIGHT_PREVIEW_URL=… npm run test:e2e`** in `webapp/` |

## 5. CSS notes (responsive fixes in-tree)

At **≤860px**: `panel__header` stacks; `quiz-stat-grid` full width; `topic-progress` stacks. Sidebar label contrast adjusted for AA on inverse surface. AI “online” chip text darkened for contrast.

## 6. References

- [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)  
- [Material 3 — Adaptive design](https://m3.material.io/foundations/layout/adaptive-design/overview)  
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (**1.4.10 Reflow**, **2.5.8 Target Size (Minimum)**)
