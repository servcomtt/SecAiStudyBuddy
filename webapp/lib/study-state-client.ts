import type { ChapterSlug } from './course-data';

export const STUDY_STATE_KEY = 'secaiplus_state';
export const AUTH_TOKEN_KEY = 'sb_token';
export const COURSE_SLUG = 'secaiplus';
export const PASSING_SCORE = 70;
export const CHAPTER_TAB_INDEX = {
  topics: 0,
  scenarios: 1,
  labs: 2,
  flashcards: 3,
  quiz: 4,
  summary: 5,
} as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_SB_API_URL ?? 'http://localhost:3001';

export type StudyCourseState = {
  progress?: Record<string, number>;
  notes?: Record<string, string>;
  topicsSeen?: Record<string, number[]>;
  scenarioSeen?: Record<string, number[]>;
  topicCurrent?: Record<string, number>;
  fcIndex?: Record<string, number>;
  chTab?: Record<string, number>;
  quizIndex?: Record<string, number>;
  quizAnswered?: Record<string, number | null>;
  quizPerAnswer?: Record<string, Array<number | null>>;
  quizScore?: Record<string, number>;
  quizCorrect?: Record<string, number>;
  quizAttempted?: Record<string, number>;
  labsCompleted?: Record<string, string[]>;
  completed?: string[];
};

export function readStudyCourseState(): StudyCourseState {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(STUDY_STATE_KEY) || '{}') as StudyCourseState;
  } catch {
    return {};
  }
}

export function writeStudyCourseState(state: StudyCourseState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STUDY_STATE_KEY, JSON.stringify(state));
}

export function getStudyAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function normalizeSeenTopicIndices(value: number[] | undefined, totalTopics: number) {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value.filter((index) => Number.isInteger(index) && index >= 0 && index < totalTopics),
  )].sort((left, right) => left - right);
}

export function computeTopicProgressPct(seenTopicCount: number, totalTopics: number) {
  if (!totalTopics) return 0;
  return Math.min(99, Math.floor((seenTopicCount / totalTopics) * 100));
}

export function normalizeCompletedLabIds(value: string[] | undefined) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.filter((activityId) => typeof activityId === 'string' && activityId.length > 0))].sort();
}

export async function syncModuleProgress(
  chapterSlug: ChapterSlug,
  state: StudyCourseState,
) {
  const token = getStudyAuthToken();
  if (!token || typeof window === 'undefined') return;

  try {
    await fetch(`${API_BASE_URL}/api/progress/${COURSE_SLUG}/${chapterSlug}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress_pct: state.progress?.[chapterSlug] ?? 0,
        active_tab: state.chTab?.[chapterSlug] ?? 0,
        topics_seen: state.topicsSeen?.[chapterSlug] ?? [],
        scenario_seen: state.scenarioSeen?.[chapterSlug] ?? [],
        topic_current: state.topicCurrent?.[chapterSlug] ?? 0,
        flashcard_index: state.fcIndex?.[chapterSlug] ?? 0,
        quiz_index: state.quizIndex?.[chapterSlug] ?? 0,
        quiz_score: state.quizScore?.[chapterSlug] ?? 0,
        quiz_correct: state.quizCorrect?.[chapterSlug] ?? 0,
        quiz_attempted: state.quizAttempted?.[chapterSlug] ?? 0,
        labs_completed: state.labsCompleted?.[chapterSlug] ?? [],
        notes_text: state.notes?.[chapterSlug] ?? null,
      }),
    });
  } catch {
    // Best-effort only while the Next app still shares the API.
  }
}

export async function markChapterComplete(chapterSlug: ChapterSlug) {
  const token = getStudyAuthToken();
  if (!token || typeof window === 'undefined') return;

  try {
    await fetch(`${API_BASE_URL}/api/progress/${COURSE_SLUG}/${chapterSlug}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch {
    // Best-effort only while the app is syncing progress remotely.
  }
}
