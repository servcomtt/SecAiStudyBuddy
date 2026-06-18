'use client';

import { useEffect, useState } from 'react';

import type { ChapterSlug } from '../lib/course-data';
import type { ChapterFlashcard } from '../lib/chapter-study-bank';
import {
  CHAPTER_TAB_INDEX,
  readStudyCourseState,
  syncModuleProgress,
  writeStudyCourseState,
} from '../lib/study-state-client';

type FlashcardSnapshot = {
  currentIndex: number;
  flipped: boolean;
};

type ChapterFlashcardsViewerProps = {
  chapterSlug: ChapterSlug;
  chapterTitle: string;
  flashcards: ChapterFlashcard[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readFlashcardSnapshot(chapterSlug: ChapterSlug, totalCards: number): FlashcardSnapshot {
  const state = readStudyCourseState();

  return {
    currentIndex: clamp(Number(state.fcIndex?.[chapterSlug] ?? 0), 0, totalCards - 1),
    flipped: false,
  };
}

function persistFlashcardIndex(chapterSlug: ChapterSlug, currentIndex: number) {
  const state = readStudyCourseState();

  state.fcIndex ??= {};
  state.chTab ??= {};

  state.fcIndex[chapterSlug] = currentIndex;
  state.chTab[chapterSlug] = CHAPTER_TAB_INDEX.flashcards;

  writeStudyCourseState(state);
  void syncModuleProgress(chapterSlug, state);
}

export function ChapterFlashcardsViewer({
  chapterSlug,
  chapterTitle,
  flashcards,
}: ChapterFlashcardsViewerProps) {
  const [snapshot, setSnapshot] = useState<FlashcardSnapshot | null>(null);

  useEffect(() => {
    const initialSnapshot = readFlashcardSnapshot(chapterSlug, flashcards.length);
    setSnapshot(initialSnapshot);
    persistFlashcardIndex(chapterSlug, initialSnapshot.currentIndex);
  }, [chapterSlug, flashcards.length]);

  if (!snapshot) {
    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Flashcards</p>
            <h3>Loading chapter flashcards</h3>
          </div>
        </div>
      </section>
    );
  }

  const card = flashcards[snapshot.currentIndex];
  const cardsSeen = Math.min(snapshot.currentIndex + 1, flashcards.length);

  function moveToCard(nextIndex: number) {
    const normalizedIndex = clamp(nextIndex, 0, flashcards.length - 1);
    const nextSnapshot = {
      currentIndex: normalizedIndex,
      flipped: false,
    };

    setSnapshot(nextSnapshot);
    persistFlashcardIndex(chapterSlug, normalizedIndex);
  }

  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Flashcards</p>
            <h3>{chapterTitle} rapid review</h3>
          </div>
          <div className="quiz-stat-grid">
            <div className="quiz-stat">
              <span className="quiz-stat__label">Card</span>
              <strong>
                {snapshot.currentIndex + 1}/{flashcards.length}
              </strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Seen</span>
              <strong>{cardsSeen}</strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Mode</span>
              <strong>{snapshot.flipped ? 'Definition' : 'Term'}</strong>
            </div>
          </div>
        </div>
        <p className="panel__copy">
          This flashcard deck saves your current card index in the shared study state, so your
          review picks up where you left off.
        </p>
      </section>

      <section className={`flashcard-panel ${snapshot.flipped ? 'flashcard-panel--flipped' : ''}`}>
        <div className="flashcard-panel__meta">
          <span className="quiz-card__badge">Card {snapshot.currentIndex + 1}</span>
          <span className="flashcard-panel__counter">{cardsSeen} reviewed so far</span>
        </div>
        <div className="flashcard-panel__body">
          <p className="eyebrow">{snapshot.flipped ? 'Definition' : 'Term'}</p>
          <h3>{snapshot.flipped ? card.def : card.term}</h3>
        </div>
        <div className="flashcard-panel__actions">
          <button type="button" className="btn-ghost" onClick={() => setSnapshot({ ...snapshot, flipped: !snapshot.flipped })}>
            {snapshot.flipped ? 'Show term' : 'Reveal definition'}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Card navigation</p>
            <h3>Move through the deck</h3>
          </div>
        </div>
        <div className="topic-nav-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => moveToCard(snapshot.currentIndex - 1)}
            disabled={snapshot.currentIndex === 0}
          >
            Previous card
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => moveToCard(snapshot.currentIndex + 1)}
            disabled={snapshot.currentIndex === flashcards.length - 1}
          >
            {snapshot.currentIndex === flashcards.length - 1 ? 'End of deck' : 'Next card'}
          </button>
        </div>
      </section>
    </div>
  );
}
