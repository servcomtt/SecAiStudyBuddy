'use client';

import { useEffect, useState } from 'react';

import type { ChapterSlug } from '../lib/course-data';
import type { ChapterTopic } from '../lib/chapter-study-bank';
import {
  CHAPTER_TAB_INDEX,
  computeTopicProgressPct,
  normalizeSeenTopicIndices,
  readStudyCourseState,
  syncModuleProgress,
  writeStudyCourseState,
} from '../lib/study-state-client';

type TopicSnapshot = {
  currentIndex: number;
  seenIndices: number[];
};

type ChapterTopicsViewerProps = {
  chapterSlug: ChapterSlug;
  chapterTitle: string;
  topics: ChapterTopic[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readTopicSnapshot(chapterSlug: ChapterSlug, totalTopics: number): TopicSnapshot {
  const state = readStudyCourseState();
  const currentIndex = clamp(Number(state.topicCurrent?.[chapterSlug] ?? 0), 0, totalTopics - 1);
  const seenIndices = normalizeSeenTopicIndices(state.topicsSeen?.[chapterSlug], totalTopics);

  if (!seenIndices.includes(currentIndex)) {
    seenIndices.push(currentIndex);
    seenIndices.sort((left, right) => left - right);
  }

  return { currentIndex, seenIndices };
}

function persistTopicSnapshot(
  chapterSlug: ChapterSlug,
  snapshot: TopicSnapshot,
  totalTopics: number,
) {
  const state = readStudyCourseState();

  state.topicCurrent ??= {};
  state.topicsSeen ??= {};
  state.progress ??= {};
  state.chTab ??= {};

  state.topicCurrent[chapterSlug] = snapshot.currentIndex;
  state.topicsSeen[chapterSlug] = snapshot.seenIndices;
  state.chTab[chapterSlug] = CHAPTER_TAB_INDEX.topics;
  state.progress[chapterSlug] = Math.max(
    state.progress[chapterSlug] ?? 0,
    computeTopicProgressPct(snapshot.seenIndices.length, totalTopics),
  );

  writeStudyCourseState(state);
  void syncModuleProgress(chapterSlug, state);
}

export function ChapterTopicsViewer({
  chapterSlug,
  chapterTitle,
  topics,
}: ChapterTopicsViewerProps) {
  const [snapshot, setSnapshot] = useState<TopicSnapshot | null>(null);

  useEffect(() => {
    const initialSnapshot = readTopicSnapshot(chapterSlug, topics.length);
    setSnapshot(initialSnapshot);
    persistTopicSnapshot(chapterSlug, initialSnapshot, topics.length);
  }, [chapterSlug, topics.length]);

  if (!snapshot) {
    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Topics</p>
            <h3>Loading chapter topics</h3>
          </div>
        </div>
      </section>
    );
  }

  const activeSnapshot = snapshot;
  const topic = topics[activeSnapshot.currentIndex];
  const topicPct = Math.round((activeSnapshot.seenIndices.length / topics.length) * 100);

  function moveToTopic(nextIndex: number) {
    const normalizedIndex = clamp(nextIndex, 0, topics.length - 1);
    const seenIndices = activeSnapshot.seenIndices.includes(normalizedIndex)
      ? activeSnapshot.seenIndices
      : [...activeSnapshot.seenIndices, normalizedIndex].sort((left, right) => left - right);
    const nextSnapshot = {
      currentIndex: normalizedIndex,
      seenIndices,
    };

    setSnapshot(nextSnapshot);
    persistTopicSnapshot(chapterSlug, nextSnapshot, topics.length);
  }

  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Chapter topics</p>
            <h3>{chapterTitle} study path</h3>
          </div>
          <div className="quiz-stat-grid">
            <div className="quiz-stat">
              <span className="quiz-stat__label">Current</span>
              <strong>
                {snapshot.currentIndex + 1}/{topics.length}
              </strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Reviewed</span>
              <strong>{activeSnapshot.seenIndices.length}</strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Coverage</span>
              <strong>{topicPct}%</strong>
            </div>
          </div>
        </div>
        <p className="panel__copy">
          Your topic progress is saved in the shared course state, so you can jump back into the
          chapter exactly where you left off.
        </p>
        <div className="topic-progress">
          <div className="topic-progress__bar">
            <div className="topic-progress__fill" style={{ width: `${topicPct}%` }} />
          </div>
          <span>{activeSnapshot.seenIndices.length} of {topics.length} topics covered</span>
        </div>
      </section>

      <section className="topic-panel">
        <div className="topic-panel__header">
          <span className="quiz-card__badge">Topic {snapshot.currentIndex + 1}</span>
          <h3>{topic.title}</h3>
        </div>
        <div className="topic-paragraphs">
          {topic.paragraphs.map((paragraph, index) => (
            <p
              key={`${chapterSlug}-topic-${snapshot.currentIndex}-paragraph-${index}`}
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </div>
        <div className="topic-keybox">
          <strong>Key point:</strong> <span dangerouslySetInnerHTML={{ __html: topic.keypoint }} />
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Topic navigation</p>
            <h3>Jump to any study section</h3>
          </div>
        </div>
        <div className="topic-dots">
          {topics.map((entry, index) => {
            const isActive = index === snapshot.currentIndex;
            const isSeen = activeSnapshot.seenIndices.includes(index);

            return (
              <button
                key={`${chapterSlug}-topic-dot-${index}`}
                type="button"
                className={`topic-dot ${isActive ? 'topic-dot--active' : ''} ${isSeen ? 'topic-dot--seen' : ''}`.trim()}
                onClick={() => moveToTopic(index)}
                title={entry.title}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="topic-nav-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => moveToTopic(snapshot.currentIndex - 1)}
            disabled={snapshot.currentIndex === 0}
          >
            Previous topic
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => moveToTopic(snapshot.currentIndex + 1)}
            disabled={snapshot.currentIndex === topics.length - 1}
          >
            {snapshot.currentIndex === topics.length - 1 ? 'All topics reviewed' : 'Next topic'}
          </button>
        </div>
      </section>
    </div>
  );
}
