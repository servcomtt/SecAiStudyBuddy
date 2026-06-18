# Study Buddy — Course Template
## Vanilla HTML/CSS/JS Single-Page Application Blueprint

> **Based on:** CompTIA SecAI+ Study Buddy (CY0-001)
> **Architecture:** Single `index.html` + `labs.js` + supporting data files
> **Runtime:** Zero dependencies — no build tools, no frameworks, no server required
> **Python execution:** Skulpt 1.2.0 (CDN) — runs Python 3 in-browser

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [File Structure](#2-file-structure)
3. [CSS Variables & Theming](#3-css-variables--theming)
4. [Application State Schema](#4-application-state-schema)
5. [Settings & Accessibility Schema](#5-settings--accessibility-schema)
6. [Sidebar Navigation Structure](#6-sidebar-navigation-structure)
7. [Page Inventory](#7-page-inventory)
8. [Chapter Page Structure (6-Tab System)](#8-chapter-page-structure-6-tab-system)
9. [Topic Data Schema](#9-topic-data-schema)
10. [Flashcard Data Schema](#10-flashcard-data-schema)
11. [Quiz Data Schema](#11-quiz-data-schema)
12. [Scenario HTML Pattern](#12-scenario-html-pattern)
13. [Labs Engine — Activity Schemas](#13-labs-engine--activity-schemas)
14. [Chapter Summary Tab](#14-chapter-summary-tab)
15. [Terminology & Glossary Schema](#15-terminology--glossary-schema)
16. [Acronym System Schema](#16-acronym-system-schema)
17. [Practice Quiz Bank Schema](#17-practice-quiz-bank-schema)
18. [JS Function Reference](#18-js-function-reference)
19. [External Scripts & CDN Dependencies](#19-external-scripts--cdn-dependencies)
20. [Skulpt Python Compatibility](#20-skulpt-python-compatibility)
21. [Naming Conventions](#21-naming-conventions)
22. [Adaptation Checklist for a New Course](#22-adaptation-checklist-for-a-new-course)

---

## 1. Project Overview

This app is a self-contained, offline-capable study companion for a certification or structured course. Every feature runs in the browser — no backend, no npm install, no build step. Drop the files in a folder and open `index.html`.

### Core Features
| Feature | Description |
|---|---|
| Chapter tabs | 6 sub-pages per chapter: Topics, Scenarios, Labs, Flashcards, Quiz, Summary |
| Topic viewer | Paginated topic slides with progress dots and key-point boxes |
| Training scenarios | Click-to-reveal Q&A scenario cards |
| Practice labs | Interactive activities: click-match, click-order, fill-blank, Python IDE |
| Flashcards | Flip-card viewer with progress tracking |
| Chapter quiz | 10-question multiple-choice quiz per chapter with explanations |
| Chapter summary | SVG progress ring, stats grid, completion checklist |
| Practice quiz | Full question bank with topic filtering and exam/training modes |
| Terminology glossary | Searchable grouped term reference |
| Acronym flashcards | Acronym flip-card viewer + mini quiz |
| Sidebar sub-nav | Collapsible chapter groups with direct tab links |
| Hamburger menu | Toggle sidebar on all screen sizes |
| Settings panel | Font size, font family, line spacing, color theme, accessibility toggles |
| Persistence | All progress and settings saved to `localStorage` |

---

## 2. File Structure

```
/CourseStudyBuddy/
│
├── index.html              # Entire app: CSS + HTML + inline JS
├── labs.js                 # Lab engine: activity definitions + rendering functions
├── quiz_data.js            # Practice quiz question bank (QUIZ_BANK array)
├── question_images.js      # Optional: question image map { questionId: 'path/to/img.png' }
├── explanations.js         # Optional: extended explanations map { questionId: 'text...' }
│
└── assets/                 # Optional: images, downloadable notebooks
    ├── ch1_notebook.ipynb
    └── ...
```

### Script load order (bottom of `<body>`)
```html
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"></script>
<script src="quiz_data.js"></script>
<script src="question_images.js"></script>
<script src="explanations.js"></script>
<script src="labs.js?v=1"></script>  <!-- bump v= after every edit to bust cache -->
<script>
  /* all inline app JS here */
</script>
```

> **Cache busting:** Increment `?v=N` on `labs.js` after every save. Browsers aggressively cache local JS files.

---

## 3. CSS Variables & Theming

All colours are driven by CSS custom properties on `:root`. Swap these 13 values to re-skin the entire app.

```css
:root {
  --primary:       #1a73e8;   /* brand blue — buttons, active states, links */
  --primary-dark:  #1557b0;   /* hover/pressed state of primary */
  --accent:        #34a853;   /* success green */
  --warning:       #fbbc04;   /* caution yellow */
  --danger:        #ea4335;   /* error / destructive red */
  --bg:            #f0f4f8;   /* page background */
  --sidebar-bg:    #1e2a3a;   /* sidebar panel */
  --sidebar-text:  #b0c4d8;   /* sidebar default text */
  --sidebar-active:#1a73e8;   /* sidebar active indicator */
  --card-bg:       #ffffff;   /* card / modal background */
  --text:          #202124;   /* primary body text */
  --text-muted:    #5f6368;   /* secondary / caption text */
  --border:        #e0e0e0;   /* dividers and input borders */
  --shadow:        0 2px 8px rgba(0,0,0,0.10);
  --radius:        12px;      /* default border-radius for cards */
  --reading-lh:    1.6;       /* line-height for reading zones (set by settings) */
}
```

### Theme override classes (applied to `<body>`)
| Class | Effect |
|---|---|
| *(none)* | Default light theme |
| `theme-dark` | Dark mode — dark backgrounds, light text |
| `theme-sepia` | Warm paper tone — easy on eyes |
| `theme-contrast` | High contrast — black/white/yellow (WCAG AAA) |
| `reduce-motion` | Kills all CSS transitions and animations |
| `bold-text` | Bolds reading paragraphs and definitions |
| `underline-links` | Forces underlines on all anchor tags |

---

## 4. Application State Schema

**localStorage key:** `'{course_slug}_state'`  *(e.g. `'secaiplus_state'`, `'secplus_state'`)*

```javascript
let state = {
  // Per-chapter progress percentage (0–100)
  progress: { ch1: 0, ch2: 0, /* ... chN: 0 */ },

  // User notes per chapter (plain text, saved on blur)
  notes: { ch1: '', ch2: '', /* ... */ },

  // Current flashcard index per chapter
  fcIndex: { ch1: 0, ch2: 0, /* ... */ },

  // Current quiz question index per chapter + special pages
  quizIndex: { ch1: 0, practiceQuiz: 0, acronyms: 0 },

  // Last selected answer index (or null = unanswered)
  quizAnswered: { ch1: null, /* ... */ },

  // Topic indices the user has visited
  topicsSeen: { ch1: [], ch2: [], /* ... */ },

  // Topic index currently displayed
  topicCurrent: { ch1: 0, ch2: 0, /* ... */ },

  // Active tab index (0–5) per chapter
  chTab: { ch1: 0, ch2: 0, /* ... */ },

  // Quiz percentage score per chapter
  quizScore: { ch1: 0, /* ... */ },

  // Count of correct answers per chapter
  quizCorrect: { ch1: 0, /* ... */ },

  // Count of attempted questions per chapter
  quizAttempted: { ch1: 0, /* ... */ },

  // Chapter IDs the user has explicitly marked complete
  completed: []
};
```

### State helpers
```javascript
function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
// Call saveState() after every user interaction that changes state.
```

### State initialisation guard
Add these guards at the top of the inline `<script>` block so old saved states don't break new keys:
```javascript
if (!state.chTab)        state.chTab = {};
if (!state.quizScore)    state.quizScore = {};
if (!state.quizCorrect)  state.quizCorrect = {};
if (!state.quizAttempted)state.quizAttempted = {};
if (!state.completed)    state.completed = [];
```

---

## 5. Settings & Accessibility Schema

**localStorage key:** `'dsb_settings'`

```javascript
const SETTINGS_DEFAULTS = {
  fontSize:       '15',     // px values: '13' | '15' | '17' | '19'
  fontFamily:     'system', // 'system' | 'serif' | 'mono' | 'dyslexic'
  lineHeight:     '1.6',    // range 1.3–2.2, step 0.1
  theme:          'default',// 'default' | 'dark' | 'sepia' | 'contrast'
  reduceMotion:   '0',      // '0' | '1'
  boldText:       '0',      // '0' | '1'
  underlineLinks: '0'       // '0' | '1'
};

const FONT_MAP = {
  system:   "'Segoe UI', system-ui, sans-serif",
  serif:    "Georgia, 'Times New Roman', serif",
  mono:     "'Consolas', 'Courier New', monospace",
  dyslexic: "'OpenDyslexic', 'Comic Sans MS', cursive"
};
```

### Settings UI components
| Component | HTML element | Setting key |
|---|---|---|
| Font size pills | `#sz-pills .settings-pill[data-sz]` | `fontSize` |
| Font family pills | `#font-pills .settings-pill[data-font]` | `fontFamily` |
| Line spacing slider | `#spacing-slider` (range input) | `lineHeight` |
| Color theme swatches | `#theme-swatches .settings-swatch[data-theme]` | `theme` |
| Reduce motion toggle | `#tog-motion` (checkbox) | `reduceMotion` |
| Bold text toggle | `#tog-bold` (checkbox) | `boldText` |
| Underline links toggle | `#tog-links` (checkbox) | `underlineLinks` |

### Settings functions
```javascript
loadSettings()           // → object: merge localStorage + SETTINGS_DEFAULTS
saveSettings(s)          // persist settings object to localStorage
applySettings(s)         // apply to <body> (fonts, classes, CSS vars)
syncSettingsUI(s)        // update modal pill/toggle states to match s
setSetting(key, value)   // update one key → save → apply → sync UI
openSettings()           // show modal, sync UI, focus close button
closeSettings()          // hide modal
resetSettings()          // restore SETTINGS_DEFAULTS → save → apply → sync
```

### Settings are applied on every page load
```javascript
document.addEventListener('DOMContentLoaded', () => {
  applySettings(loadSettings()); // MUST be first line
  // ... rest of init
});
```

---

## 6. Sidebar Navigation Structure

### HTML skeleton
```html
<nav id="sidebar">

  <!-- Branding -->
  <div id="sidebar-header">
    <div class="book-badge">EXAM-CODE</div>
    <h1>Course Study Buddy</h1>
    <p>Exam Prep Tagline</p>
  </div>

  <!-- Navigation links -->
  <nav>
    <div class="nav-section">Overview</div>
    <a href="#" class="active" onclick="showPage('dashboard', this)">
      <span class="ch-num">⌂</span> Dashboard
    </a>
    <a href="#" onclick="showPage('domains', this)">
      <span class="ch-num">◎</span> Exam Domains
    </a>

    <div class="nav-section">Chapters</div>

    <!-- Repeat for each chapter (ch1 … chN) -->
    <div class="nav-ch-group" id="nav-group-ch1">
      <a href="#" id="nav-ch1" onclick="showPage('ch1', this); return false;">
        <span class="ch-num">1</span> Chapter One Title
        <span class="ch-progress" id="prog-ch1">0%</span>
        <span class="nav-ch-arrow">›</span>
      </a>
      <div class="nav-ch-sub" id="nav-sub-ch1">
        <a href="#" class="nav-sub-item" onclick="navChTab('ch1',0); return false;">📋 Topics</a>
        <a href="#" class="nav-sub-item" onclick="navChTab('ch1',1); return false;">🏋️ Scenarios</a>
        <a href="#" class="nav-sub-item" onclick="navChTab('ch1',2); return false;">🧪 Labs</a>
        <a href="#" class="nav-sub-item" onclick="navChTab('ch1',3); return false;">🃏 Flashcards</a>
        <a href="#" class="nav-sub-item" onclick="navChTab('ch1',4); return false;">❓ Quiz</a>
        <a href="#" class="nav-sub-item" onclick="navChTab('ch1',5); return false;">📊 Summary</a>
      </div>
    </div>
    <!-- /chapter group -->

    <div class="nav-section">Review</div>
    <a href="#" onclick="showPage('acronyms', this)">
      <span class="ch-num">🃏</span> Acronym Flashcards
    </a>
    <a href="#" onclick="showPage('terminology', this)">
      <span class="ch-num">T</span> Terminology
    </a>
    <a href="#" onclick="showPage('practiceQuiz', this)">
      <span class="ch-num">📝</span> Practice Quiz
    </a>
  </nav>

  <!-- Settings cog — always visible at bottom -->
  <div id="sidebar-footer">
    <button id="settings-cog-btn" onclick="openSettings()">
      <span class="cog-icon">⚙️</span>
      <span>Settings &amp; Accessibility</span>
    </button>
  </div>

</nav>
```

### Sidebar CSS states
| Selector | Meaning |
|---|---|
| `#sidebar` | Visible (default desktop) |
| `#sidebar.collapsed` | Hidden — `transform: translateX(-270px)` (desktop toggle) |
| `#sidebar.open` | Visible — `transform: translateX(0)` (mobile toggle) |
| `#main.sidebar-hidden` | `margin-left: 0` (desktop, when sidebar collapsed) |
| `#sidebar-overlay.active` | Dark backdrop (mobile, when sidebar open) |
| `.nav-ch-group.open .nav-ch-sub` | Expanded sub-nav — `max-height: 280px` |
| `.nav-sub-item.active` | Active tab highlighted |

### Key nav functions
```javascript
showPage(id, el)          // Switch to page `id`, highlight el in sidebar
showChTab(ch, tabIdx)     // Switch active tab within a chapter page
navChTab(ch, tabIdx)      // showPage(ch) + showChTab(ch, tabIdx) combined
toggleSidebar()           // Hamburger: desktop = push/pull, mobile = overlay
```

---

## 7. Page Inventory

Each page is a `<div id="page-{id}" class="page">` inside `<div id="content">`. Only the `.active` page is visible (`display: block`).

| Page ID | Title | Description |
|---|---|---|
| `dashboard` | Dashboard | Course overview, chapter cards with progress bars, quick-start hero |
| `domains` | Exam Domains | Domain weightings table, objective coverage map |
| `ch1` … `chN` | Chapter pages | 6-tab learning pages (see Section 8) |
| `practiceQuiz` | Practice Quiz | Full question bank with setup/quiz/results screens |
| `terminology` | Terminology | Searchable grouped glossary |
| `acronyms` | Acronym Flashcards | Flip-card viewer + mini quiz for abbreviations |

### `chapterTitles` object — maps page ID to topbar display title
```javascript
const chapterTitles = {
  dashboard:    'Dashboard',
  domains:      'Exam Domains',
  ch1:          'Ch 1: Chapter One Title',
  ch2:          'Ch 2: Chapter Two Title',
  // ...
  practiceQuiz: 'Practice Quiz',
  terminology:  'Terminology',
  acronyms:     'Acronym Flashcards'
};
```

---

## 8. Chapter Page Structure (6-Tab System)

### How tabs are initialised
`initChapterTabs(ch)` runs once on first visit to a chapter page. It DOM-restructures the existing chapter children into 6 labelled tab panels and inserts the tab bar after `.chapter-hero`. It must only run once — guard with `dataset.tabsInit`.

### Chapter page HTML skeleton
```html
<div id="page-ch1" class="page">

  <!-- Hero (always visible above tabs) -->
  <div class="chapter-hero">
    <div class="ch-num-big">Chapter 1</div>
    <h2>Chapter Title</h2>
    <p>Brief description of what this chapter covers.</p>
  </div>

  <!-- Tab bar is injected here by initChapterTabs() -->

  <!-- TAB 0: Topics -->
  <div id="ch1-topics-section">
    <!-- Topic viewer rendered by renderTopics('ch1') -->
    <div id="topic-viewer-ch1"></div>
    <!-- Navigation controls -->
    <div class="topic-nav">
      <button id="tp-prev-ch1" onclick="prevTopic('ch1')">← Prev</button>
      <span id="tc-ch1">Topic 1 of N</span>
      <button id="tp-next-ch1" onclick="nextTopic('ch1')">Next →</button>
    </div>
    <!-- Progress indicator -->
    <div id="tdots-ch1"></div>
    <div id="tp-bar-ch1"></div>
    <span id="tp-label-ch1">0 of N topics covered</span>
  </div>

  <!-- TAB 1: Scenarios -->
  <div id="ch1-scenarios-section">
    <div class="scenarios-list">
      <!-- scenario-item × 8 (see Section 12) -->
    </div>
  </div>

  <!-- TAB 2: Labs -->
  <div id="ch1-labs-section">
    <div id="lab-section-ch1">
      <!-- Lab cards (see Section 13) -->
    </div>
  </div>

  <!-- TAB 3: Flashcards -->
  <div id="ch1-flashcards-section">
    <div class="flip-card-container" id="fc-ch1">
      <div class="flip-card" id="fc-card-ch1">
        <div class="flip-front" id="fc-front-ch1">Term text</div>
        <div class="flip-back"  id="fc-back-ch1">Definition text</div>
      </div>
    </div>
    <div class="fc-controls">
      <button onclick="prevCard('ch1')">← Prev</button>
      <span id="fc-counter-ch1">1 / N</span>
      <button onclick="nextCard('ch1')">Next →</button>
      <button onclick="flipCard('ch1')">Flip 🔄</button>
    </div>
  </div>

  <!-- TAB 4: Quiz -->
  <div id="ch1-quiz-section">
    <div id="quiz-ch1"></div>
    <!-- Rendered by renderQuiz('ch1') -->
  </div>

  <!-- TAB 5: Summary -->
  <div id="ch1-summary-section">
    <div id="ch-summary-ch1"></div>
    <!-- Rendered by renderChSummary('ch1') -->
  </div>

</div><!-- /page-ch1 -->
```

### Tab index reference
| Index | Name | Icon | Notes widget? |
|---|---|---|---|
| 0 | Topics | 📋 | Yes |
| 1 | Scenarios | 🏋️ | Yes |
| 2 | Labs | 🧪 | Yes |
| 3 | Flashcards | 🃏 | Yes |
| 4 | Quiz | ❓ | No |
| 5 | Summary | 📊 | No (analytics only) |

### Notes widget (tabs 0–3)
Each of the first four tabs includes a collapsible notes textarea. Notes are saved to `state.notes[ch]` on every keystroke.

```html
<div class="ch-notes-widget">
  <div class="cnw-header" onclick="this.parentElement.classList.toggle('open')">
    📝 My Notes <span class="cnw-arrow">›</span>
  </div>
  <div class="cnw-body">
    <textarea id="notes-ch1" oninput="state.notes['ch1']=this.value; saveState()"
      placeholder="Type your notes here..."></textarea>
  </div>
</div>
```

---

## 9. Topic Data Schema

**Object:** `TOPICS` (inline in `index.html`)

```javascript
const TOPICS = {
  ch1: [
    {
      title: 'Topic Slide Title',
      paragraphs: [
        'First paragraph of body text...',
        'Second paragraph...',
        'Third paragraph...'
      ],
      keypoint: 'One-sentence exam-focused takeaway. Optional — omit key if not needed.'
    },
    // 6–8 topic objects per chapter recommended
  ],
  ch2: [ /* ... */ ],
  // ...
};
```

### Topic viewer rendering
`renderTopics(ch)` builds `.topic-slide` divs inside `#topic-viewer-{ch}`. Only one slide is `.active` at a time. Progress dots are built by `initTopicDots(ch)` using `CH_TOPIC_COUNTS`.

```javascript
const CH_TOPIC_COUNTS = {
  ch1: 7,  // must match TOPICS[ch1].length
  ch2: 8,
  // ...
};
```

---

## 10. Flashcard Data Schema

**Object:** `flashcards` (inline in `index.html`)

```javascript
const flashcards = {
  ch1: [
    { term: 'Term Name',           def: 'Full definition of the term...' },
    { term: 'Another Term',        def: 'Its definition...' },
    // 10 cards per chapter recommended
  ],
  ch2: [ /* ... */ ],
  // ...
};
```

### Flashcard functions
```javascript
updateCard(ch)   // load flashcards[ch][state.fcIndex[ch]] into #fc-front/back
flipCard(ch)     // toggle .flipped class on #fc-card-{ch}
nextCard(ch)     // increment fcIndex (wraps), call updateCard
prevCard(ch)     // decrement fcIndex (wraps), call updateCard
```

---

## 11. Quiz Data Schema

**Object:** `quizzes` (inline in `index.html`)

```javascript
const quizzes = {
  ch1: [
    {
      q:    'Full question text?',
      opts: ['Option A', 'Option B', 'Option C', 'Option D'],
      ans:  2,      // 0-indexed correct answer (here = 'Option C')
      exp:  'Explanation of why Option C is correct...'
    },
    // 10 questions per chapter recommended
  ],
  ch2: [ /* ... */ ],
  // ...
};
```

### Quiz state fields
```javascript
state.quizIndex[ch]     // current question index (0 … N-1)
state.quizAnswered[ch]  // selected option index, or null
state.quizScore[ch]     // final % score (set after last question)
state.quizCorrect[ch]   // running count of correct answers
state.quizAttempted[ch] // running count of answered questions
```

### Quiz functions
```javascript
renderQuiz(ch)        // render current question + options into #quiz-{ch}
answerQuiz(ch, i)     // record answer i, calculate score, update state, re-render
nextQuiz(ch)          // advance quizIndex, clear quizAnswered, re-render
```

---

## 12. Scenario HTML Pattern

Scenarios are written directly as HTML inside the chapter's scenarios section. There is no external data object — markup is the source of truth.

```html
<div class="scenarios-list">

  <div class="scenario-item">
    <div class="scenario-q" onclick="toggleScenario(this)">
      <span class="scenario-toggle-icon">▶</span>
      <span class="sq-text">
        📌 Scenario question or case study prompt text goes here. What would you do?
      </span>
    </div>
    <div class="scenario-a">
      <span class="sa-label">✅ Answer</span>
      The correct approach and explanation. Reference specific exam objectives where relevant.
    </div>
  </div>

  <!-- Repeat × 8 per chapter -->

</div>
```

**Rule:** 8 scenarios per chapter. Each must map to at least one exam objective.

---

## 13. Labs Engine — Activity Schemas

All lab content lives in `labs.js`. The `LABS` object maps chapter IDs to activity arrays.

### LABS object structure
```javascript
var LABS = {
  ch1: {
    notebook: null,  // or { filename: 'ch1_notebook.ipynb' } for download link
    activities: [
      { /* activity object */ },
      { /* activity object */ },
      // 2–4 activities per chapter recommended
    ]
  },
  ch2: { /* ... */ },
  // ...
};
```

### Lab card HTML (in index.html)
Each activity needs a matching card stub in the chapter's labs section:
```html
<div id="lab-section-ch1">

  <div class="lab-card" id="lab-card-ch1-lab-order">
    <div class="lab-card-header">
      <span class="lab-card-title">Activity Title</span>
    </div>
    <p class="lab-instructions">One-line instruction visible above the activity.</p>
    <div id="lab-body-ch1-lab-order"></div>
  </div>

  <!-- Repeat for each activity -->

</div>
```
The `id` on `.lab-card` must match `'lab-card-' + activity.id`.
The `id` on the body div must match `'lab-body-' + activity.id`.

---

### Activity Type A: `click-order`
User reorders items with ↑ ↓ buttons to match the correct sequence.

```javascript
{
  type: 'click-order',
  id: 'ch1-lab-order',
  title: '🔢 Activity Display Title',
  instructions: 'Use the ↑ ↓ buttons to arrange the steps in the correct sequence.',
  items: [
    'Step label 1',
    'Step label 2',
    'Step label 3',
    'Step label 4',
    'Step label 5'
  ],
  answer: [
    'Step label 1',  // correct position 0
    'Step label 3',  // correct position 1
    'Step label 2',  // correct position 2
    'Step label 5',  // correct position 3
    'Step label 4'   // correct position 4
  ],
  explanation: 'Brief explanation of the correct order shown after submission.'
}
```

---

### Activity Type B: `click-match`
User clicks a card to select it, then clicks a category zone to place it.

```javascript
{
  type: 'click-match',
  id: 'ch1-lab-match',
  title: '🎯 Activity Display Title',
  instructions: 'Click a card to select it, then click the correct category zone.',
  categories: ['Category A', 'Category B', 'Category C'],
  items: [
    { text: 'Item text 1', category: 'Category A' },
    { text: 'Item text 2', category: 'Category B' },
    { text: 'Item text 3', category: 'Category A' },
    { text: 'Item text 4', category: 'Category C' },
    // 6–10 items recommended
  ]
}
```

---

### Activity Type C: `fill-blank`
User types the correct answer into text inputs.

```javascript
{
  type: 'fill-blank',
  id: 'ch1-lab-fill',
  title: '✏️ Activity Display Title',
  instructions: 'Type the correct term for each definition.',
  questions: [
    {
      prompt: 'The definition or sentence with a _____ blank to fill in.',
      answer: 'correctword'    // case-insensitive, trimmed match
    },
    // 4–8 questions recommended
  ]
}
```

> **Answer matching:** Comparison is `.toLowerCase().trim()`. Acceptable to use single-word or short-phrase answers.

---

### Activity Type D: `code-lab` (Python IDE)
Multi-tab Python editor powered by Skulpt. Each code cell maps to one file tab. Markdown cells provide per-exercise instructions.

```javascript
{
  type: 'code-lab',
  id: 'ch1-lab-code',
  title: '🐍 Python: Activity Title',
  instructions: 'One-line overview shown in the lab card header.',
  cells: [
    // Pattern: markdown → code → markdown → code → ...
    // Each markdown cell provides the instruction for the following code cell.

    {
      type: 'markdown',
      content: '<strong>Exercise 1:</strong> Description of what this exercise covers.'
    },
    {
      type: 'code',
      code: `# Exercise 1: Python code here
# Uses tab label: setup.py (first cell) or exercise_N.py (subsequent)
value = 42
print("Value:", value)`
    },

    {
      type: 'markdown',
      content: '<strong>Exercise 2:</strong> Description of exercise 2.'
    },
    {
      type: 'code',
      code: `# Exercise 2
data = [1, 2, 3]
for item in data:
    print(item)`
    }

    // Up to ~5 exercise pairs recommended per lab
  ]
}
```

### File tab naming (auto-generated)
| Cell index | Tab label |
|---|---|
| Only one code cell | `main.py` |
| First of multiple | `setup.py` |
| 2nd, 3rd, … | `exercise_1.py`, `exercise_2.py`, … |

### Skulpt limitations — DO NOT use in code cells
The following Python modules are **not supported** by Skulpt 1.2.0:
- `sqlite3` — use dict-based table simulation instead
- `pandas` — use list-of-dicts instead
- `numpy` — use pure Python math
- `matplotlib` — use text-based output charts
- `os`, `pathlib`, `subprocess` — not available
- f-strings containing `${...}` — conflicts with JS template literals; use `%` or `.format()` instead

### Skulpt supported modules
`math`, `random`, `re`, `sys`, `io`, `json`, `itertools`, `functools`, `collections`, `datetime` (partial)

---

## 14. Chapter Summary Tab

`renderChSummary(ch)` generates the full summary panel into `#ch-summary-{ch}`.

### What it renders

**1. Progress ring (SVG)**
- Circular gauge 0–100 %
- Colour: `--accent` green (≥80 %), `--warning` yellow (≥50 %), `--danger` red (<50 %)
- Badge text: "🏆 Excellent" / "📈 In Progress" / "🌱 Getting Started"

**2. Stats grid (4 cards)**
| Stat | Source |
|---|---|
| Topics Studied | `state.topicsSeen[ch].length` / `CH_TOPIC_COUNTS[ch]` |
| Flashcards Seen | `state.fcIndex[ch] + 1` / `flashcards[ch].length` |
| Quiz Score | `state.quizScore[ch]` % |
| Chapter Status | "Done ✅" if `state.progress[ch] === 100`, else "In Progress" |

**3. Completion checklist (6 items)**
- Topics Reviewed — checked if any topics seen
- Scenarios Explored — checked at 50 % progress
- Labs Attempted — checked at 60 % progress
- Flashcards Reviewed — checked if any cards flipped
- Quiz Completed — checked if `state.quizAttempted[ch] > 0`
- Chapter Marked Complete — checked if `state.progress[ch] === 100`

**4. Action buttons**
- `← Back to Topics` → `showChTab(ch, 0)`
- `Take Quiz →` → `showChTab(ch, 4)`

---

## 15. Terminology & Glossary Schema

**Object:** `termGroups` (inline in `index.html`)

```javascript
const termGroups = [
  {
    group: 'Group Heading (e.g. Domain 1 — Data Concepts)',
    terms: [
      {
        term: 'Term Name',
        def: 'Full definition of the term. Can be multi-sentence.',
        subtypes: [            // optional: sub-entries under this term
          { name: 'Subtype A', def: 'Definition of subtype A.' },
          { name: 'Subtype B', def: 'Definition of subtype B.' }
        ]
      },
      // 8–15 terms per group recommended
    ]
  },
  // 4–6 groups recommended
];
```

### Terminology functions
```javascript
renderTermGroups(filter)    // render all groups, filtered by search string
filterTerms(val)            // called on search input, calls renderTermGroups(val)
toggleTermGroup(header)     // expand/collapse a group accordion
```

---

## 16. Acronym System Schema

**Arrays:** `acronyms` and `acronymQuiz` (inline in `index.html`)

```javascript
// Flashcard data
const acronyms = [
  { acro: 'SQL',  full: 'Structured Query Language' },
  { acro: 'ETL',  full: 'Extract, Transform, Load' },
  // 30–60 acronyms recommended
];

// Quiz questions (can be auto-generated from acronyms or hand-crafted)
const acronymQuiz = [
  {
    q:    'What does ETL stand for?',
    opts: ['Extract, Transform, Load', 'Export, Transfer, Load',
           'Evaluate, Test, Launch', 'Extract, Transfer, Log'],
    ans:  0
  },
  // one quiz entry per acronym recommended
];
```

### Acronym functions
```javascript
updateAcroCard()            // load current card into flip viewer
flipAcro()                  // toggle .flipped on #acro-card
nextAcro() / prevAcro()     // navigate, wrap around
shuffleAcro()               // Fisher-Yates shuffle of acronyms array
renderAcroQuiz()            // render current quiz question
answerAcroQuiz(i)           // record answer, show feedback
nextAcroQuiz()              // advance quiz index
renderAcroTable()           // render full reference table of all acronyms
```

---

## 17. Practice Quiz Bank Schema

**File:** `quiz_data.js`

```javascript
// Exported as global variable — no ES module syntax
var QUIZ_BANK = [
  {
    id:     'q001',              // unique question ID
    domain: 'Domain Name',       // used for topic filtering
    ch:     'ch1',               // source chapter
    q:      'Question text?',
    opts:   ['A', 'B', 'C', 'D'],
    ans:    1,                   // 0-indexed
    multi:  false,               // true if multiple correct answers
    exp:    'Explanation...'     // shown in training mode after answer
  },
  // ...
];
```

> **Note:** `multi: true` questions accept an array for `ans`: `ans: [0, 2]`

### Practice quiz modes
| Mode | Behaviour |
|---|---|
| Training | Shows explanation immediately after each answer |
| Exam | No feedback until all questions answered; shows results summary |

### Practice quiz screens (pqShowScreen)
- `'setup'` — topic checkboxes, count selector, mode toggle, Start button
- `'quiz'` — question/answer view with progress bar
- `'results'` — score breakdown by domain, review wrong answers

---

## 18. JS Function Reference

### Navigation
| Function | Purpose |
|---|---|
| `showPage(id, el)` | Activate page, update sidebar, lazy-init content |
| `showChTab(ch, tabIdx)` | Switch chapter tab, highlight sidebar sub-item, lazy-render |
| `navChTab(ch, tabIdx)` | `showPage` + `showChTab` in sequence |
| `toggleSidebar()` | Hamburger: push layout (desktop) or overlay (mobile) |
| `openSettings()` / `closeSettings()` | Settings modal open/close |

### Topics
| Function | Purpose |
|---|---|
| `renderTopics(ch)` | Build `.topic-slide` elements from `TOPICS[ch]` |
| `showTopic(ch, idx, markSeen)` | Display topic, update dots/bar/progress |
| `prevTopic(ch)` / `nextTopic(ch)` | Navigate topics |
| `initTopicDots(ch)` | Build progress dot row |

### Flashcards
| Function | Purpose |
|---|---|
| `updateCard(ch)` | Load card content from `flashcards[ch]` |
| `flipCard(ch)` | Toggle front/back |
| `nextCard(ch)` / `prevCard(ch)` | Navigate, wrap around |

### Chapter Quiz
| Function | Purpose |
|---|---|
| `renderQuiz(ch)` | Build question UI into `#quiz-{ch}` |
| `answerQuiz(ch, i)` | Record answer, compute score, re-render |
| `nextQuiz(ch)` | Advance to next question |

### Chapter Summary
| Function | Purpose |
|---|---|
| `renderChSummary(ch)` | Build full summary panel (SVG ring + stats + checklist) |
| `markComplete(ch)` | Set `state.progress[ch] = 100`, save, re-render |

### Progress & State
| Function | Purpose |
|---|---|
| `saveState()` | Persist `state` to localStorage |
| `updateProgressUI()` | Update sidebar % badges and dashboard progress bars |
| `resetProgress()` | Clear all progress (confirm dialog first) |
| `dashChAction(ch)` | Dashboard card button: Continue / Restart |

### Notes
| Function | Purpose |
|---|---|
| `saveNotes(ch)` | Write textarea value to `state.notes[ch]`, save |
| `openChNotes(ch, title)` | Open notes full-screen viewer |
| `saveChNotes()` | Save from full-screen notes viewer |

### Settings
| Function | Purpose |
|---|---|
| `loadSettings()` | Read from localStorage, merge defaults |
| `saveSettings(s)` | Persist to localStorage |
| `applySettings(s)` | Apply fonts/themes/classes to `<body>` |
| `syncSettingsUI(s)` | Update modal pill/swatch/toggle states |
| `setSetting(key, val)` | Update + save + apply + sync UI |
| `resetSettings()` | Restore defaults |

### Labs (labs.js)
| Function | Purpose |
|---|---|
| `renderLabSection(ch)` | Init all activities for chapter |
| `initClickMatch(id)` | Render and wire click-match activity |
| `checkClickMatch(id)` | Evaluate click-match answers |
| `initClickOrder(id)` | Render and wire click-order activity |
| `checkClickOrder(id)` | Evaluate order against `activity.answer` |
| `initFillBlank(id)` | Render fill-blank inputs |
| `checkFillBlank(id)` | Evaluate trimmed, lowercase answers |
| `renderCodeLab(id)` | Build full IDE window |
| `ideRun(id)` | Execute code via Skulpt |
| `ideReset(id)` | Restore original code from `_ideState[id].origCells` |
| `ideShowTab(id, n)` | Switch file tab, save/load cell code, update instructions |
| `ideUpdateLines(id)` | Sync line number gutter with editor content |
| `ideSync(id)` | Sync gutter scroll with editor scroll |
| `ideKeyDown(e, id)` | Tab key → 4 spaces |
| `_getActivity(id)` | Lookup activity object across all LABS chapters |
| `downloadNotebook(ch)` | Trigger `.ipynb` file download |

### Terminology
| Function | Purpose |
|---|---|
| `renderTermGroups(filter)` | Build glossary HTML from `termGroups` |
| `filterTerms(val)` | Called on search input change |
| `toggleTermGroup(el)` | Expand/collapse accordion group |

### Acronyms
| Function | Purpose |
|---|---|
| `updateAcroCard()` | Load current acronym into flip viewer |
| `flipAcro()` | Flip card |
| `nextAcro()` / `prevAcro()` | Navigate |
| `shuffleAcro()` | Randomise order |
| `renderAcroTable()` | Build full reference table |
| `renderAcroQuiz()` | Build quiz question UI |
| `answerAcroQuiz(i)` | Record answer, show feedback |
| `nextAcroQuiz()` | Advance quiz |

### Practice Quiz
| Function | Purpose |
|---|---|
| `pqInit()` | Set up practice quiz state |
| `pqSetMode(m)` | `'training'` or `'exam'` |
| `pqSetCount(n)` | Number of questions (10 / 25 / 50 / all) |
| `pqToggleTopic(t, btn)` | Toggle domain filter |
| `pqStart()` | Build filtered question pool, show quiz screen |
| `pqGetPool()` | Return filtered + shuffled question array |
| `pqShowScreen(name)` | Switch between setup / quiz / results |
| `pqAnswer(i)` | Record answer in practice quiz |
| `pqNext()` | Advance to next question or show results |

---

## 19. External Scripts & CDN Dependencies

```html
<!-- Python 3 runtime (browser, ~300 KB) -->
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulkt-stdlib.js"></script>

<!-- Local data files -->
<script src="quiz_data.js"></script>         <!-- var QUIZ_BANK = [...] -->
<script src="question_images.js"></script>   <!-- var QUESTION_IMAGES = {...} — optional -->
<script src="explanations.js"></script>      <!-- var EXPLANATIONS = {...} — optional -->

<!-- Labs engine — bump v= after every edit -->
<script src="labs.js?v=1"></script>
```

> **Offline use:** All CDN scripts can be downloaded and self-hosted. Replace CDN `src` with local paths. No other external resources are required.

---

## 20. Skulpt Python Compatibility

### Safe to use
```
Built-ins: print, len, range, list, dict, set, tuple, str, int, float, bool,
           type, isinstance, zip, enumerate, sorted, reversed, map, filter,
           min, max, sum, abs, round, input (prints prompt, returns ''),
           try/except, classes, generators, list comprehensions

Modules:   math, random, re, sys, io, json, itertools, functools,
           collections.OrderedDict, collections.defaultdict
```

### Do not use (will throw runtime error)
```
sqlite3, pandas, numpy, scipy, matplotlib, seaborn, plotly
os, pathlib, subprocess, socket, http
f-strings with ${...} inside JS template literals  ← JS parser conflict
```

### Workaround patterns

**Instead of sqlite3:**
```python
# Simulate a relational table with a list of dicts
orders = [
    {'id': 1, 'product': 'Widget', 'amount': 29.99},
    {'id': 2, 'product': 'Gadget', 'amount': 49.99},
]
# Query with list comprehension
expensive = [o for o in orders if o['amount'] > 30]
for row in expensive:
    print("%-10s $%.2f" % (row['product'], row['amount']))
```

**Instead of f-strings with $:**
```python
# BAD  — breaks JS template literal parsing
name = "World"
print(f"Hello ${name}!")

# GOOD — use % formatting
print("Hello %s!" % name)

# GOOD — use .format()
print("Hello {}!".format(name))
```

---

## 21. Naming Conventions

| Item | Pattern | Example |
|---|---|---|
| Page div ID | `page-{pageId}` | `page-ch1`, `page-dashboard` |
| Chapter tab panel | `chp-{ch}-{n}` | `chp-ch1-0` |
| Chapter tab bar | `chtabs-{ch}` | `chtabs-ch1` |
| Topic viewer | `topic-viewer-{ch}` | `topic-viewer-ch2` |
| Topic slide | `{ch}-topic-{n}` | `ch1-topic-0` |
| Topic dots | `tdots-{ch}` | `tdots-ch3` |
| Topic progress bar | `tp-bar-{ch}` | `tp-bar-ch1` |
| Topic progress label | `tp-label-{ch}` | `tp-label-ch1` |
| Topic counter | `tc-{ch}` | `tc-ch1` |
| Flashcard container | `fc-ch1` | `fc-ch1` |
| Flashcard element | `fc-card-{ch}` | `fc-card-ch1` |
| Flashcard front/back | `fc-front-{ch}` / `fc-back-{ch}` | |
| Flashcard counter | `fc-counter-{ch}` | |
| Quiz container | `quiz-{ch}` | `quiz-ch2` |
| Summary container | `ch-summary-{ch}` | `ch-summary-ch1` |
| Lab section | `lab-section-{ch}` | `lab-section-ch1` |
| Lab card | `lab-card-{actId}` | `lab-card-ch1-lab-order` |
| Lab body | `lab-body-{actId}` | `lab-body-ch1-lab-order` |
| Activity ID | `{ch}-lab-{slug}` | `ch1-lab-match`, `ch3-lab-code` |
| IDE wrapper | `ide-{actId}` | `ide-ch1-lab-code` |
| IDE editor | `ide-code-{actId}` | |
| IDE output | `ide-out-{actId}` | |
| IDE instruction | `ide-instr-{actId}` | |
| IDE run button | `ide-run-{actId}` | |
| IDE tab bar | `ide-tabs-{actId}` | |
| Sidebar nav group | `nav-group-{ch}` | `nav-group-ch1` |
| Sidebar chapter link | `nav-{ch}` | `nav-ch1` |
| Sidebar sub-nav | `nav-sub-{ch}` | `nav-sub-ch1` |
| Progress badge | `prog-{ch}` | `prog-ch1` |
| Notes textarea | `notes-{ch}` | `notes-ch1` |
| Chapter summary | `ch-summary-{ch}` | `ch-summary-ch1` |

---

## 22. Adaptation Checklist for a New Course

Use this checklist when creating a new Study Buddy app from this template.

### Setup
- [ ] Copy `index.html`, `labs.js`, `quiz_data.js`, `question_images.js`, `explanations.js`
- [ ] Find-and-replace the course slug (e.g. `secaiplus` → `secplus`) in `STATE_KEY` and `SETTINGS_KEY`
- [ ] Update `<title>` tag and `#sidebar-header` branding (badge, h1, tagline)
- [ ] Update `chapterTitles` object with correct chapter names
- [ ] Set `CH_TOPIC_COUNTS` to match your topic counts per chapter

### Content — per chapter (repeat for ch1 … chN)
- [ ] Write `TOPICS[ch]` — 6–8 topic slides with paragraphs + keypoints
- [ ] Write `flashcards[ch]` — 10 term/def pairs
- [ ] Write `quizzes[ch]` — 10 quiz questions (q, opts, ans, exp)
- [ ] Write 8 scenario HTML blocks in the chapter's scenarios section
- [ ] Add `LABS.ch` object in `labs.js` — 2–4 activities
- [ ] Add corresponding lab card stubs in chapter HTML
- [ ] Add sidebar sub-nav group for the chapter
- [ ] Add chapter page HTML skeleton (hero, 6 section divs)

### Review content
- [ ] Populate `termGroups` — 4–6 groups × 8–15 terms
- [ ] Populate `acronyms` array
- [ ] Populate `acronymQuiz` array
- [ ] Populate `QUIZ_BANK` in `quiz_data.js` — full practice question bank

### Exam domains page
- [ ] Update `#page-domains` with correct domain names, weightings, and objective lists

### Verify
- [ ] All `CH_TOPIC_COUNTS` values match actual `TOPICS[ch].length`
- [ ] All `activity.id` values match their `lab-card-{id}` and `lab-body-{id}` HTML
- [ ] No Python code cells use `sqlite3`, `pandas`, `numpy`, or `f"${...}"`
- [ ] `labs.js?v=` query param incremented after final edit
- [ ] Settings localStorage key is unique to this course
- [ ] State localStorage key is unique to this course
- [ ] All chapter IDs referenced consistently (`ch1`…`chN` or custom slugs)
- [ ] Tested in Chrome and Firefox (Skulpt performs best in V8-based browsers)

### Optional enhancements
- [ ] Add `.ipynb` notebooks to `/assets/` and set `LABS.chN.notebook.filename`
- [ ] Add question images to `question_images.js` map
- [ ] Add extended explanations to `explanations.js` map
- [ ] Self-host Skulpt for offline use
- [ ] Add custom theme colour by extending the `:root` CSS variables and theme override classes

---

---

## 23. Database Layer

The optional database layer adds multi-user support, canonical progress reporting, and completion certificates. The SPA continues to work offline using `localStorage`; the database is the sync target and source of truth.

### Architecture overview

```
┌──────────────────────────────────┐       ┌─────────────────────┐
│         Browser (SPA)            │  HTTP │   Node.js / Express │
│                                  │◄─────►│      server.js      │
│  index.html + inline JS          │  JWT  │                     │
│  labs.js                         │       │  better-sqlite3     │
│  db-client.js  ◄── NEW           │       │  (or pg for prod)   │
│                                  │       └──────────┬──────────┘
│  localStorage  (offline cache)   │                  │
└──────────────────────────────────┘       ┌──────────▼──────────┐
                                           │  SQLite / PostgreSQL │
                                           │  db/schema.*.sql     │
                                           └─────────────────────┘
```

### Files

| File | Purpose |
|---|---|
| `server.js` | Express API — all routes, JWT auth, DB abstraction |
| `db/schema.pg.sql` | PostgreSQL DDL — canonical schema with indexes, views, triggers |
| `db/schema.sqlite.sql` | SQLite DDL — identical tables, SQLite-compatible syntax |
| `db/seeds.sql` | Seed data — admin user, demo student, SecAIPlus course, all 24 labs |
| `db-client.js` | Frontend sync client — wraps `saveState()`, injects auth UI |
| `package.json` | Node dependencies and helper npm scripts |

### Table inventory (11 tables)

| # | Table | Key purpose |
|---|---|---|
| 1 | `users` | Accounts, roles, per-user accessibility settings |
| 2 | `courses` | Course catalogue (slug, exam code, passing score) |
| 3 | `modules` | Chapters within a course (maps to `ch1`…`chN` page IDs) |
| 4 | `course_enrollments` | Explicit enrolment; supports expiry dates and paid tiers |
| 5 | `labs` | Lab activities (`activity_id` matches `labs.js` LABS object) |
| 6 | `user_lab_entitlements` | Per-lab access control (auto-granted on enrolment) |
| 7 | `lab_attempts` | One row per lab session; stores score, answers, feedback |
| 8 | `lab_event_log` | Append-only event stream (code_run, reset, tab_switch…) |
| 9 | `module_progress` | Mirrors client `state` object — server is the source of truth |
| 10 | `quiz_attempts` | Chapter quiz, practice quiz, and acronym quiz completions |
| 11 | `completion_certificates` | Issued automatically when all modules reach 100 % |

> **Added beyond the original nine:** `course_enrollments` (explicit access control) and `quiz_attempts` (quiz tracking separate from interactive lab attempts).

### Reporting views

| View | Returns |
|---|---|
| `vw_user_course_summary` | Per-user completion %, avg quiz score, certificate status |
| `vw_lab_performance` | Pass rate, avg score, avg time per lab activity |
| `vw_daily_active_users` | DAU by course for the last 30 days *(PostgreSQL only)* |
| `vw_struggling_labs` | Labs with lowest pass rates (min 10 attempts) *(PostgreSQL only)* |

### API endpoints

**Auth**
```
POST  /api/auth/register          Register new user → JWT token
POST  /api/auth/login             Login → JWT token
GET   /api/auth/me                Fetch current user + settings
PATCH /api/auth/settings          Save accessibility settings
PATCH /api/auth/password          Change password
```

**Courses & Progress**
```
GET   /api/courses                List enrolled courses
GET   /api/courses/:slug          Course detail + modules
GET   /api/progress/:courseSlug   All module progress (returns state-shaped object)
PUT   /api/progress/:courseSlug/:moduleSlug   Upsert module progress
POST  /api/progress/:courseSlug/:moduleSlug/complete   Mark complete; auto-issues cert
```

**Labs**
```
GET   /api/labs/:courseSlug/:moduleSlug       List labs + best score per user
POST  /api/labs/attempts                      Start a lab attempt
PUT   /api/labs/attempts/:id                  Submit / update attempt
POST  /api/labs/attempts/:id/events           Batch-append event log entries
GET   /api/labs/attempts                      User's attempt history
```

**Quizzes & Certificates**
```
POST  /api/quiz/attempts          Record a completed quiz
GET   /api/certificates           User's certificates
GET   /api/certificates/:certNum  Verify a certificate (public, no auth)
```

**Admin / Reporting** *(admin role required)*
```
GET   /api/admin/users                        Paginated user list (search supported)
GET   /api/admin/users/:userId/progress       One user's full progress detail
GET   /api/admin/reports/completion           Completion rates per module
GET   /api/admin/reports/labs                 Lab performance (pass rate, avg score)
GET   /api/admin/reports/activity             Daily active users (30-day window)
POST  /api/admin/enroll                       Enroll a user + auto-grant lab entitlements
```

### Quick start

```bash
# 1. Install dependencies
npm install

# 2. Init + seed the SQLite database
npm run db:init
npm run db:seed

# 3. Start the server (default: http://localhost:3001)
npm start

# Dev mode (auto-restart on file change)
npm run dev

# Generate a bcrypt hash for a new password
npm run hash -- yourpassword

# Reset database to seed state
npm run db:reset
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP port |
| `DATABASE_URL` | *(unset = SQLite)* | `postgres://user:pass@host/db` |
| `DB_PATH` | `./db/studybuddy.db` | SQLite file path |
| `JWT_SECRET` | dev default | **Change in production** |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed SPA origin |
| `CERT_PREFIX` | `SB` | Certificate number prefix |

### Frontend integration

Add `db-client.js` to `index.html` **before** `labs.js`:

```html
<!-- Optional: configure API URL and course slug before loading client -->
<script>
  window.SB_API_URL = 'http://localhost:3001';
  window.SB_COURSE  = 'secaiplus';  // must match courses.slug in DB
</script>
<script src="db-client.js"></script>   <!-- NEW: before labs.js -->
<script src="labs.js?v=24"></script>
```

`db-client.js` automatically:
- Injects **Sign in / Register** buttons into the topbar when unauthenticated
- Patches `saveState()` to also push progress to the server on every write
- Patches `saveSettings()` to sync accessibility preferences across devices
- On login, pulls server state and merges it into `localStorage` (server wins)
- Queues failed sync calls and retries them when the browser comes back online
- Falls back silently to `localStorage`-only if the server is unreachable

### Global helpers exposed by db-client.js

```javascript
SbAuth.login(email, password)           // → user object
SbAuth.register(email, password, name)  // → user object
SbAuth.logout()
SbAuth.syncFromServer()                 // pull latest state from server

SbLabs.startAttempt(activity_id)        // → { attempt_id, attempt_number }
SbLabs.submitAttempt(id, { score, passed, time_spent_s, answer_json, feedback_json })
SbLabs.logEvent(attempt_id, event_type, payload)

SbQuiz.record({ quiz_type, module_slug, mode, question_count, correct_count, score, answer_json })

SbCerts.get()                           // → array of user's certificates

SbUi.openAuthModal('login' | 'register')
```

### Adaptation checklist for a new course

- [ ] Set `window.SB_COURSE` to the new course's `slug` (must match `courses.slug` in DB)
- [ ] Run `db:seed` after adding the new course row and module rows to `seeds.sql`
- [ ] Ensure all `activity_id` values in `labs.js` match `labs.activity_id` rows in the DB
- [ ] Set `JWT_SECRET` to a unique secret per deployment
- [ ] Set `CORS_ORIGIN` to the domain serving your SPA
- [ ] For production, set `DATABASE_URL` to a PostgreSQL connection string and run `db:pg:init`

---

*Template version: 1.1 — database layer added*
*Architecture: vanilla HTML/CSS/JS SPA + optional Node.js/Express + SQLite/PostgreSQL*
