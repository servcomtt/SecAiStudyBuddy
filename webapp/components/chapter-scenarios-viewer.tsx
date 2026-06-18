'use client';

import { useEffect, useState } from 'react';

import type { ChapterScenario } from '../lib/chapter-study-bank';
import type { ChapterSlug } from '../lib/course-data';
import {
  CHAPTER_TAB_INDEX,
  computeTopicProgressPct,
  normalizeSeenTopicIndices,
  readStudyCourseState,
  syncModuleProgress,
  writeStudyCourseState,
} from '../lib/study-state-client';

type ScenarioSnapshot = {
  openIndex: number | null;
  seenIndices: number[];
};

type ChapterScenariosViewerProps = {
  chapterSlug: ChapterSlug;
  chapterTitle: string;
  scenarios: ChapterScenario[];
};

function readScenarioSnapshot(chapterSlug: ChapterSlug, totalScenarios: number): ScenarioSnapshot {
  const state = readStudyCourseState();
  return {
    openIndex: null,
    seenIndices: normalizeSeenTopicIndices(state.scenarioSeen?.[chapterSlug], totalScenarios),
  };
}

function persistScenarioSnapshot(
  chapterSlug: ChapterSlug,
  snapshot: ScenarioSnapshot,
  totalScenarios: number,
) {
  const state = readStudyCourseState();

  state.scenarioSeen ??= {};
  state.chTab ??= {};
  state.progress ??= {};

  state.scenarioSeen[chapterSlug] = snapshot.seenIndices;
  state.chTab[chapterSlug] = CHAPTER_TAB_INDEX.scenarios;
  state.progress[chapterSlug] = Math.max(
    state.progress[chapterSlug] ?? 0,
    computeTopicProgressPct(snapshot.seenIndices.length, totalScenarios),
  );

  writeStudyCourseState(state);
  void syncModuleProgress(chapterSlug, state);
}

export function ChapterScenariosViewer({
  chapterSlug,
  chapterTitle,
  scenarios,
}: ChapterScenariosViewerProps) {
  const [snapshot, setSnapshot] = useState<ScenarioSnapshot | null>(null);

  useEffect(() => {
    const initialSnapshot = readScenarioSnapshot(chapterSlug, scenarios.length);
    setSnapshot(initialSnapshot);
    persistScenarioSnapshot(chapterSlug, initialSnapshot, scenarios.length);
  }, [chapterSlug, scenarios.length]);

  if (!snapshot) {
    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Scenarios</p>
            <h3>Loading scenario drills</h3>
          </div>
        </div>
      </section>
    );
  }

  const activeSnapshot = snapshot;
  const reviewedPct = scenarios.length
    ? Math.round((activeSnapshot.seenIndices.length / scenarios.length) * 100)
    : 0;

  function toggleScenario(index: number) {
    const isOpen = activeSnapshot.openIndex === index;
    const seenIndices = activeSnapshot.seenIndices.includes(index)
      ? activeSnapshot.seenIndices
      : [...activeSnapshot.seenIndices, index].sort((left, right) => left - right);
    const nextSnapshot = {
      openIndex: isOpen ? null : index,
      seenIndices,
    };

    setSnapshot(nextSnapshot);
    persistScenarioSnapshot(chapterSlug, nextSnapshot, scenarios.length);
  }

  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Training scenarios</p>
            <h3>{chapterTitle} applied practice</h3>
          </div>
          <div className="quiz-stat-grid">
            <div className="quiz-stat">
              <span className="quiz-stat__label">Scenario set</span>
              <strong>{scenarios.length}</strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Reviewed</span>
              <strong>{activeSnapshot.seenIndices.length}</strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Coverage</span>
              <strong>{reviewedPct}%</strong>
            </div>
          </div>
        </div>
        <p className="panel__copy">
          Opening a scenario records that review progress in the shared study state so your chapter
          coverage stays current.
        </p>
        <div className="topic-progress">
          <div className="topic-progress__bar">
            <div className="topic-progress__fill" style={{ width: `${reviewedPct}%` }} />
          </div>
          <span>{activeSnapshot.seenIndices.length} of {scenarios.length} scenarios explored</span>
        </div>
      </section>

      <section className="scenario-list">
        {scenarios.map((scenario, index) => {
          const isOpen = activeSnapshot.openIndex === index;
          const isSeen = activeSnapshot.seenIndices.includes(index);

          return (
            <article
              key={`${chapterSlug}-scenario-${index}`}
              className={`scenario-panel ${isOpen ? 'scenario-panel--open' : ''}`}
            >
              <button
                type="button"
                className="scenario-panel__question"
                onClick={() => toggleScenario(index)}
                aria-expanded={isOpen}
              >
                <span className="scenario-panel__index">{index + 1}</span>
                <span
                  className="scenario-panel__prompt"
                  dangerouslySetInnerHTML={{ __html: scenario.promptHtml }}
                />
                <span className="scenario-panel__meta">
                  {isSeen ? 'Reviewed' : 'New'} {isOpen ? '▾' : '▸'}
                </span>
              </button>
              {isOpen ? (
                <div className="scenario-panel__answer">
                  <span className="scenario-panel__answer-label">Answer</span>
                  <div dangerouslySetInnerHTML={{ __html: scenario.answerHtml }} />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
