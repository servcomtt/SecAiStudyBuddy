'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { ChapterSlug } from '../lib/course-data';
import {
  CHAPTER_TAB_INDEX,
  markChapterComplete,
  normalizeCompletedLabIds,
  normalizeSeenTopicIndices,
  PASSING_SCORE,
  readStudyCourseState,
  syncModuleProgress,
  writeStudyCourseState,
} from '../lib/study-state-client';

type ChapterSummaryPanelProps = {
  chapterSlug: ChapterSlug;
  chapterTitle: string;
  topicCount: number;
  scenarioCount: number;
  labCount: number;
  flashcardCount: number;
  quizCount: number;
  nextChapterSlug: ChapterSlug | null;
};

type SummarySnapshot = {
  topicsDone: number;
  scenariosDone: number;
  labsDone: number;
  flashcardsSeen: number;
  quizScore: number;
  quizAttempted: number;
  chapterComplete: boolean;
  overallPct: number;
};

function createSummarySnapshot(
  chapterSlug: ChapterSlug,
  topicCount: number,
  scenarioCount: number,
  labCount: number,
  flashcardCount: number,
  quizCount: number,
): SummarySnapshot {
  const state = readStudyCourseState();
  const seenTopics = normalizeSeenTopicIndices(state.topicsSeen?.[chapterSlug], topicCount);
  const seenScenarios = normalizeSeenTopicIndices(state.scenarioSeen?.[chapterSlug], scenarioCount);
  const completedLabs = normalizeCompletedLabIds(state.labsCompleted?.[chapterSlug]);
  const topicsDone = Math.min(seenTopics.length, topicCount);
  const scenariosDone = Math.min(seenScenarios.length, scenarioCount);
  const labsDone = Math.min(completedLabs.length, labCount);
  const flashcardsSeen =
    state.fcIndex?.[chapterSlug] === undefined
      ? 0
      : Math.min((state.fcIndex[chapterSlug] ?? 0) + 1, flashcardCount);
  const quizScore = state.quizScore?.[chapterSlug] ?? 0;
  const quizAttempted = state.quizAttempted?.[chapterSlug] ?? 0;
  const chapterComplete =
    state.progress?.[chapterSlug] === 100 || Boolean(state.completed?.includes(chapterSlug));

  const parts = [];
  if (topicCount > 0) parts.push((topicsDone / topicCount) * 100);
  if (scenarioCount > 0) parts.push((scenariosDone / scenarioCount) * 100);
  if (labCount > 0) parts.push((labsDone / labCount) * 100);
  if (flashcardCount > 0) parts.push((flashcardsSeen / flashcardCount) * 100);
  if (quizCount > 0) parts.push(quizScore);

  const overallPct = parts.length ? Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length) : 0;

  return {
    topicsDone,
    scenariosDone,
    labsDone,
    flashcardsSeen,
    quizScore,
    quizAttempted,
    chapterComplete,
    overallPct,
  };
}

export function ChapterSummaryPanel({
  chapterSlug,
  chapterTitle,
  topicCount,
  scenarioCount,
  labCount,
  flashcardCount,
  quizCount,
  nextChapterSlug,
}: ChapterSummaryPanelProps) {
  const [snapshot, setSnapshot] = useState<SummarySnapshot | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    setSnapshot(
      createSummarySnapshot(
        chapterSlug,
        topicCount,
        scenarioCount,
        labCount,
        flashcardCount,
        quizCount,
      ),
    );
  }, [chapterSlug, topicCount, scenarioCount, labCount, flashcardCount, quizCount]);

  if (!snapshot) {
    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Summary</p>
            <h3>Loading chapter summary</h3>
          </div>
        </div>
      </section>
    );
  }

  const masteryReady =
    snapshot.topicsDone >= topicCount &&
    snapshot.scenariosDone >= scenarioCount &&
    snapshot.labsDone >= labCount &&
    snapshot.flashcardsSeen >= flashcardCount &&
    snapshot.quizScore >= PASSING_SCORE;

  async function handleMarkComplete() {
    setIsCompleting(true);

    const state = readStudyCourseState();
    state.progress ??= {};
    state.chTab ??= {};
    state.completed ??= [];

    state.progress[chapterSlug] = 100;
    state.chTab[chapterSlug] = CHAPTER_TAB_INDEX.summary;

    if (!state.completed.includes(chapterSlug)) {
      state.completed.push(chapterSlug);
    }

    writeStudyCourseState(state);
    await Promise.allSettled([
      syncModuleProgress(chapterSlug, state),
      markChapterComplete(chapterSlug),
    ]);

    setSnapshot(
      createSummarySnapshot(
        chapterSlug,
        topicCount,
        scenarioCount,
        labCount,
        flashcardCount,
        quizCount,
      ),
    );
    setIsCompleting(false);
  }

  const checklist = [
    {
      label: `Topics reviewed (${snapshot.topicsDone}/${topicCount})`,
      done: snapshot.topicsDone >= topicCount,
    },
    {
      label: `Scenarios explored (${snapshot.scenariosDone}/${scenarioCount})`,
      done: snapshot.scenariosDone >= scenarioCount,
    },
    {
      label: `Labs completed (${snapshot.labsDone}/${labCount})`,
      done: snapshot.labsDone >= labCount,
    },
    {
      label: `Flashcards reviewed (${snapshot.flashcardsSeen}/${flashcardCount})`,
      done: snapshot.flashcardsSeen >= flashcardCount,
    },
    {
      label: snapshot.quizAttempted > 0 ? `Quiz attempted (${snapshot.quizScore}%)` : 'Quiz attempted',
      done: snapshot.quizAttempted > 0,
    },
    {
      label: `Passing score reached (${PASSING_SCORE}%+)`,
      done: snapshot.quizScore >= PASSING_SCORE,
    },
    {
      label: 'Chapter marked complete',
      done: snapshot.chapterComplete,
    },
  ];

  return (
    <div className="stack-xl">
      <section className="summary-hero">
        <div>
          <p className="eyebrow">Chapter summary</p>
          <h3>{chapterTitle} progress snapshot</h3>
          <p className="panel__copy">
            This summary reads your shared study state and rolls your topics, flashcards, labs,
            scenarios, and quiz progress into one view.
          </p>
        </div>
        <div className={`summary-score summary-score--${snapshot.overallPct >= 80 ? 'strong' : snapshot.overallPct >= 50 ? 'mid' : 'early'}`}>
          <span>Overall</span>
          <strong>{snapshot.overallPct}%</strong>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span className="summary-card__label">Topics</span>
          <strong>{snapshot.topicsDone}</strong>
          <p>{topicCount} total study topics reviewed</p>
        </article>
        <article className="summary-card">
          <span className="summary-card__label">Flashcards</span>
          <strong>{snapshot.flashcardsSeen}</strong>
          <p>{flashcardCount} cards visited in this chapter deck</p>
        </article>
        <article className="summary-card">
          <span className="summary-card__label">Practice</span>
          <strong>
            {snapshot.scenariosDone + snapshot.labsDone}
          </strong>
          <p>
            {snapshot.scenariosDone}/{scenarioCount} scenarios and {snapshot.labsDone}/{labCount} labs
            progressed
          </p>
        </article>
        <article className="summary-card">
          <span className="summary-card__label">Quiz</span>
          <strong>{snapshot.quizScore}%</strong>
          <p>
            {snapshot.quizAttempted > 0
              ? `${snapshot.quizAttempted} question${snapshot.quizAttempted === 1 ? '' : 's'} answered in the current attempt`
              : 'No quiz attempt recorded yet'}
          </p>
        </article>
        <article className="summary-card">
          <span className="summary-card__label">Status</span>
          <strong>{snapshot.chapterComplete ? 'Complete' : masteryReady ? 'Ready' : 'In progress'}</strong>
          <p>
            {snapshot.chapterComplete
              ? 'This chapter has been marked complete.'
              : masteryReady
                ? 'You have cleared the main readiness signals for this chapter.'
                : 'Keep working through the slices below to finish the chapter cleanly.'}
          </p>
        </article>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Checklist</p>
            <h3>Readiness signals</h3>
          </div>
        </div>
        <div className="summary-checklist">
          {checklist.map((item) => (
            <div key={item.label} className={`summary-checklist__item ${item.done ? 'summary-checklist__item--done' : ''}`}>
              <span>{item.done ? '✅' : '⬜'}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Actions</p>
            <h3>Keep moving</h3>
          </div>
        </div>
        <div className="summary-actions">
          <Link href={`/chapters/${chapterSlug}/topics`} className="btn-ghost">
            Review topics
          </Link>
          <Link href={`/chapters/${chapterSlug}/scenarios`} className="btn-ghost">
            Open scenarios
          </Link>
          <Link href={`/chapters/${chapterSlug}/labs`} className="btn-ghost">
            Open labs
          </Link>
          <Link href={`/chapters/${chapterSlug}/flashcards`} className="btn-ghost">
            Open flashcards
          </Link>
          <Link href={`/chapters/${chapterSlug}/quiz`} className="btn-primary">
            {snapshot.quizAttempted > 0 ? 'Retake quiz' : 'Take quiz'}
          </Link>
          <button type="button" className="btn-primary" onClick={handleMarkComplete} disabled={isCompleting || snapshot.chapterComplete}>
            {snapshot.chapterComplete ? 'Chapter complete' : isCompleting ? 'Saving completion...' : 'Mark chapter complete'}
          </button>
          {nextChapterSlug ? (
            <Link href={`/chapters/${nextChapterSlug}/topics`} className="btn-ghost">
              Next chapter
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
