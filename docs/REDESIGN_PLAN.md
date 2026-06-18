# Study Buddy LMS — Redesign Plan  v1.0
**Date:** 2026-03-29
**Scope:** UX, UI, Learner Flow, Admin Experience
**Based on:** Design review of the SecAIPlus Study Buddy blueprint

---

## Executive Summary

The platform has a strong technical foundation: offline-first, modular, comprehensive. The redesign goal is not to add features—it is to make existing features feel **guided, adaptive, and visually intentional**. The shift is from *tool-oriented* to *learner-journey-oriented*.

**Before:** Learner picks from 6 equal tabs, a deep sidebar, and a static dashboard.
**After:** Learner follows a guided flow, a smart dashboard tells them what to do next, and the system adapts based on performance.

---

## Priority Matrix

| # | Priority | Effort | Impact | Status |
|---|----------|--------|--------|--------|
| 1 | Guided chapter flow (Learn → Practice → Check → Review) | Medium | 🔴 High | Implement |
| 2 | Dashboard action center (resume, weak domains, labs, streaks) | Medium | 🔴 High | Implement |
| 3 | Mobile bottom nav + tablet rail | Low | 🔴 High | Implement |
| 4 | Immersive lab workspace (zones, history, graded vs practice) | Medium | 🟠 High | Implement |
| 5 | Assessment-to-remediation loop | Medium | 🔴 High | Implement |
| 6 | Learner identity & motivation (achievements, streaks, mastery) | Low-Med | 🟠 Medium | Phase 2 |
| 7 | Visual hierarchy upgrade (section headers, card differentiation) | Low | 🟠 Medium | Phase 2 |
| 8 | Accessibility hardening (focus states, ARIA, tap targets, skip nav) | Medium | 🟠 Medium | Phase 2 |
| 9 | Content modularity (reusable block types) | High | 🟡 Medium | Phase 3 |
| 10 | Instructor/admin experience (cohort views, reporting dashboards) | High | 🟡 Medium | Phase 3 |
| 11 | Spec split (UX / content model / frontend / backend / admin) | High | 🟡 Low-Med | Phase 3 |
| 12 | Confidence selection + distractor explanations in quiz | Low | 🟠 Medium | Phase 2 |

---

## Section 1 — UX Specification

### 1.1 Core Design Principles

1. **Show one primary action per screen.** Every view should have a clear "what to do next."
2. **Progress is visible and meaningful.** Numbers alone are not enough—show context (e.g., "3 topics behind schedule").
3. **The system adapts to learner performance.** Weak areas surface automatically; no manual hunting.
4. **Accessibility is native, not optional.** Contrast, focus states, and tap targets are defaults, not settings.
5. **Offline first.** No connectivity-dependent degradation of the core study experience.

---

### 1.2 Navigation Architecture

#### Current state
```
Sidebar (always visible, all 8 chapters expanded)
  └─ Chapter 1
       ├─ Topics
       ├─ Scenarios
       ├─ Labs
       ├─ Flashcards
       ├─ Quiz
       └─ Summary
```

#### Target state

**Desktop (≥ 1024px):** Persistent sidebar, chapters collapsed by default, one chapter open at a time, sub-items appear only when chapter is open.

**Tablet (768–1023px):** Slim navigation rail (icons + short labels only). Click rail item to open a full-width drawer.

**Mobile (< 768px):** Sidebar hidden. Fixed **bottom navigation bar** with four destinations:
- 🏠 Home (dashboard)
- 📖 Learn (current chapter)
- 🎯 Practice (quiz / flashcards)
- 👤 Profile (settings, progress, certificates)

Chapter switching on mobile → sheet that slides up from the bottom navigation.

#### Sidebar simplification rules
- Show at most **5 sub-navigation items** per chapter; hide "Summary" until chapter is ≥ 80% complete.
- Use **progressive disclosure**: show sub-items only for the active chapter.
- Replace all 8 chapter rows with a compact **Course Progress** indicator at the top of the sidebar, and a scrollable chapter list below.

---

### 1.3 Chapter UX — Guided Flow Model

#### Current model: 6 equal tabs
```
[📋 Topics] [🏋️ Scenarios] [🧪 Labs] [🃏 Flashcards] [❓ Quiz] [📊 Summary]
```

#### Target model: 4-step guided flow

```
Step 1: LEARN          → Topics + Scenario (read + apply)
Step 2: PRACTICE       → Labs + Flashcards (do + remember)
Step 3: CHECK          → Chapter Quiz (assess)
Step 4: REVIEW         → Summary + Weak topics (consolidate)
```

**Implementation pattern:**
- A **chapter stepper** replaces the tab bar as the primary UI.
  - Steps are unlocked progressively: Step 2 unlocks after ≥ 2 topics read; Step 3 unlocks after any Lab or 5 Flashcards; Step 4 unlocks after Quiz attempt.
- The 6 original tabs remain accessible via an **"All tabs"** link for power users.
- Each chapter card on the dashboard shows a **"Continue"** button pointing to the next unlocked step.

**Stepper visual spec:**
```
● LEARN  ──  ○ PRACTICE  ──  ○ CHECK  ──  ○ REVIEW
  Active       Locked           Locked       Locked
```
- Completed step: filled circle, checkmark icon, faded label.
- Active step: filled circle, primary color, bold label.
- Locked step: hollow circle, gray label, lock icon.

---

### 1.4 Dashboard — Action Center

#### Current state
Static hero + 4 stat cards + chapter cards grid.

#### Target state

**Hero card — "Resume where you left off"**
```
┌────────────────────────────────────────────────────────┐
│  👋 Welcome back, Alex                                 │
│  Pick up where you left off:                          │
│  Chapter 4 · Data Analysis  ─  Step 2: Practice       │
│                          [ Continue → ]               │
└────────────────────────────────────────────────────────┘
```

**4 smart stat widgets**
| Widget | Data source | Action |
|--------|-------------|--------|
| Overall progress | `progress` state across all chapters | — |
| Quiz average | mean of all `quizScore` values | "View weak areas" |
| Study streak | computed from `last_active_at` dates | — |
| Labs completed | count of submitted lab attempts | "Try incomplete" |

**Needs attention row**
Appears only when ≥ 1 chapter has quiz score < 70%.
```
⚠ Needs review:  [Chapter 3] [Chapter 6]   (click → routes to quiz)
```

**Recommended next block**
Based on most-recently-active chapter:
- If no quiz attempted → suggest quiz
- If quiz < 70% → suggest review + remediation
- If all complete → suggest practice quiz

**Achievement shelf** (Phase 2)
- Last 3 unlocked badges shown inline on the dashboard.

---

## Section 2 — UI Specification

### 2.1 Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--text-xs` | 11px | Labels, meta |
| `--text-sm` | 13px | Secondary body, captions |
| `--text-base` | 15px | Body copy |
| `--text-md` | 17px | Card headings, question text |
| `--text-lg` | 20px | Section headers |
| `--text-xl` | 24px | Page titles |
| `--text-2xl` | 32px | Hero numbers |

### 2.2 Spacing Scale

Add `--space-{n}` tokens: 4, 8, 12, 16, 24, 32, 48, 64px.

### 2.3 Card Differentiation

| Card type | Left border color | Icon |
|-----------|------------------|------|
| Topic/reading | `--primary` blue | 📖 |
| Scenario | `--accent` green | 🏋️ |
| Lab (practice) | `#9c27b0` purple | 🧪 |
| Lab (graded) | `#e91e63` pink | 🏆 |
| Flashcard set | `--warning` amber | 🃏 |
| Quiz | `--danger` red | ❓ |
| Summary | `--text-muted` gray | 📊 |

### 2.4 Visual Hierarchy Fixes

1. **Section headers** → 20px, 700 weight, 8px bottom border using `--primary` color.
2. **Progress bars** → increase height from 6px to 8px; add percentage label to the right.
3. **Chapter hero** → add per-chapter accent color (defined in data, applied as `--ch-accent`).
4. **Active step** in stepper → bold + larger font + drop shadow.
5. **CTA buttons** → primary action always uses `--primary` filled; secondary uses outline.

### 2.5 Color Tokens — Chapter Accents

```
ch1: #1a73e8  (blue)     ch5: #0097a7  (teal)
ch2: #34a853  (green)    ch6: #7b1fa2  (purple)
ch3: #e65100  (orange)   ch7: #c62828  (crimson)
ch4: #f9a825  (amber)    ch8: #2e7d32  (forest)
```

---

## Section 3 — Learner Flow

### 3.1 New Learner (first visit)

```
Landing page → Start course → Chapter 1 LEARN step (topics)
→ [Topic complete notification] → Next topic / or advance to PRACTICE
→ After 2 topics: PRACTICE unlocks → flashcards/lab available
→ After 5 flashcards or 1 lab: CHECK unlocks → quiz available
→ After quiz: REVIEW unlocks → summary + personalized weak-topic list
→ Dashboard: Chapter 1 marked complete → Chapter 2 opened
```

### 3.2 Returning Learner

```
Dashboard → "Resume where you left off" card
→ Direct to last active step of most recently active chapter
→ "Needs review" banner if quiz < 70%
```

### 3.3 Assessment-to-Remediation Loop

```
Quiz submitted → score displayed
  ├─ Score ≥ 80%:  "Great work! → Continue to Chapter N+1"
  ├─ Score 60–79%: "Good effort. Review these topics: [list]"
  │                 → Click topic → scroll to exact topic slide
  └─ Score < 60%:  "Let's review" → automatically opens REVIEW step
                    → Shows per-question breakdown
                    → Each wrong answer links to source topic
                    → Retake quiz button after review
```

**Distractor explanations:**
Every wrong quiz option should have a `why_wrong` field in the question data:
```javascript
{
  text: 'This answer is wrong because...',
  why_wrong: ['opt-a': 'Confuses X with Y', 'opt-b': 'This is true but not the best answer', ...]
}
```
These are shown in the review mode after submission.

### 3.4 Learning Loop (connected study tools)

```
Topic read → [Suggest: related scenario] (toast notification)
Scenario complete → [Suggest: mini lab]
Lab submitted → [Suggest: 3 related flashcards]
5 flashcards reviewed → [Suggest: checkpoint quiz]
Quiz < 70% → [Route: back to weakest topic]
```

Suggestions appear as a **"Next step" card** at the bottom of each completed activity, not as modal popups.

---

## Section 4 — Lab Workspace Redesign

### 4.1 Lab Layout (new)

```
┌─────────────────────────────────────────────────────────────────┐
│  🧪 Lab 2.1 — Filtering Data with Pandas         [Practice]    │
│  ─────────────────────────────────────────────────────────────  │
│  OBJECTIVES        │  INSTRUCTIONS            │  HINTS         │
│  ────────────────  │  ──────────────────────  │  ──────────── │
│  ○ Load a CSV      │  1. Import pandas as pd  │  [Hint 1 🔒]  │
│  ● Filter rows     │  2. Use df[df.col > val] │  [Hint 2 🔒]  │
│  ○ Print results   │                          │  [Hint 3 🔒]  │
│                    │                          │               │
│  ─────────────────────────────────────────────────────────────  │
│  [CODE EDITOR]                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  [CONSOLE OUTPUT]            │  ATTEMPT HISTORY               │
│                              │  #1 ✓ 85%  2 min ago           │
│                              │  #2 ✗ 40%  yesterday           │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Practice vs Graded Distinction

| Attribute | Practice Lab | Graded Lab |
|-----------|-------------|-----------|
| Badge color | Purple | Pink/Red |
| Attempts | Unlimited | Limited (set in `max_attempts`) |
| Score counted | No | Yes (in module progress) |
| Hints | Available | Locked until 2nd attempt |
| Header label | "Practice" | "Graded · Attempt N of M" |

### 4.3 Objective Tracking

- Each lab activity defines `objectives: ['...', '...']` in the data schema.
- Objectives appear as a checklist; auto-checked when corresponding code passes validation.
- Final submission only enabled when ≥ 1 objective is checked.

---

## Section 5 — Admin / Instructor Experience

### 5.1 Admin Dashboard Widgets (Phase 3)

- **Cohort overview:** enrolled count, active this week, completion %, avg quiz score.
- **Struggling learners table:** users with avg quiz < 60%, sorted by last active date.
- **Lab difficulty chart:** pass rate per lab (from `vw_struggling_labs` view).
- **Quiz outcome trends:** per-chapter score distribution over time.
- **Content effectiveness:** topics with highest drop-off rate (topics_seen analysis).

### 5.2 Admin UI Pages (Phase 3)

| Page | Route | Key actions |
|------|-------|-------------|
| Cohort Overview | `/admin` | Filter by course, date range |
| Learner Detail | `/admin/users/:id` | View full progress, lab attempts, quiz history |
| Lab Analytics | `/admin/labs` | Filter by module, sort by pass rate |
| Quiz Analytics | `/admin/quiz` | Per-question difficulty analysis |
| Enrollment | `/admin/enroll` | Add/remove users, set expiry |
| Certificate Log | `/admin/certs` | View/revoke certificates |

---

## Section 6 — Accessibility Hardening (Phase 2)

### 6.1 Base interface (non-configurable)

- **Tap targets:** minimum 44×44px for all interactive elements.
- **Focus states:** 3px `--primary` outline on all focusable elements, never `outline: none`.
- **Skip navigation:** `<a href="#main" class="skip-nav">Skip to content</a>` as first body element.
- **ARIA roles:** `role="tablist"` / `role="tab"` / `role="tabpanel"` on chapter tab system; `role="progressbar"` on progress bars; `aria-live="polite"` on quiz feedback.
- **Contrast default:** body text `#202124` on `#f0f4f8` = 8.1:1 ratio (WCAG AAA). Card text must maintain ≥ 4.5:1.
- **Motion default:** `prefers-reduced-motion` media query respected natively, not only via the toggle.
- **Form labels:** all inputs have explicit `<label>` or `aria-label`.
- **Error messages:** linked to inputs with `aria-describedby`.

---

## Section 7 — Phase 2 Motivation Systems

### 7.1 Achievement Badges

| Badge | Trigger |
|-------|---------|
| First Step | Complete first topic |
| Speed Reader | Read 5 topics in one session |
| Lab Rat | Complete 3 labs |
| Quiz Master | Score ≥ 90% on any chapter quiz |
| Perfectionist | Score 100% on any chapter quiz |
| Consistent | 3-day study streak |
| On Fire | 7-day study streak |
| Domain Expert | Complete all topics in one chapter |
| Certified Ready | Complete entire course |

### 7.2 Study Streak

- A streak day = any `saveState()` call that changes `lastActive` to a new calendar date.
- Streak breaks if no activity for 48+ hours (gives a 24h grace window).
- Stored in `state.streak` (count) and `state.lastStreakDate`.

### 7.3 Mastery Levels per Chapter

| Level | Criteria |
|-------|---------|
| 🔰 Introduced | Any topic read |
| 📖 Learning | All topics read |
| 🏋️ Practicing | 1+ lab completed |
| ✅ Proficient | Quiz ≥ 70% |
| 🏆 Mastered | Quiz ≥ 90% + all labs passed |

---

## Section 8 — Content Model (reusable blocks)

### 8.1 Block Types

| Block | Schema fields | Renders as |
|-------|--------------|------------|
| `concept-card` | title, body, icon | Highlighted info box |
| `worked-example` | prompt, steps[], answer | Step-by-step walkthrough |
| `guided-scenario` | context, tasks[], outcome | Narrative scenario |
| `micro-check` | question, options[], correct | Inline 1-question check |
| `challenge-lab` | objectives[], cells[] | Full IDE lab |
| `exam-tip` | tip, domain | Yellow callout box |
| `recap-card` | bullets[] | End-of-topic summary bullets |

These replace the current free-form topic content and make each block individually targetable for remediation routing.

---

## Implementation Milestones

### Phase 1 (Current sprint — Priority 1–5)
- [x] Guided chapter stepper (Learn → Practice → Check → Review)
- [x] Dashboard action center
- [x] Mobile bottom navigation + tablet rail
- [x] Lab workspace redesign (zones, graded vs practice)
- [x] Assessment-to-remediation loop

### Phase 2
- [ ] Achievement/badge system
- [ ] Study streak tracking
- [ ] Chapter mastery levels
- [ ] Confidence selection in quiz
- [ ] Distractor explanations
- [ ] Accessibility hardening pass

### Phase 3
- [ ] Admin/instructor dashboards
- [ ] Content block system
- [ ] Spec document split (UX / content / frontend / backend / admin)
- [ ] Course authoring workflow
