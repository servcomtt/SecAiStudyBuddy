'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type {
  ChapterLabActivity,
  ChapterLabDefinition,
  ClickMatchActivity,
  ClickOrderActivity,
  CodeLabActivity,
  FillBlankActivity,
} from '../lib/chapter-lab-bank';
import type { ChapterSlug } from '../lib/course-data';
import {
  CHAPTER_TAB_INDEX,
  computeTopicProgressPct,
  normalizeCompletedLabIds,
  readStudyCourseState,
  syncModuleProgress,
  writeStudyCourseState,
} from '../lib/study-state-client';

type ChapterLabsWorkspaceProps = {
  chapterSlug: ChapterSlug;
  chapterTitle: string;
  labDefinition: ChapterLabDefinition;
};

type LabsSnapshot = {
  completedIds: string[];
};

type Feedback =
  | { kind: 'warn'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'success'; message: string }
  | null;

function shuffleArray<T>(values: T[]) {
  const copy = [...values];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function readLabsSnapshot(chapterSlug: ChapterSlug): LabsSnapshot {
  const state = readStudyCourseState();
  return {
    completedIds: normalizeCompletedLabIds(state.labsCompleted?.[chapterSlug]),
  };
}

function persistLabsSnapshot(
  chapterSlug: ChapterSlug,
  snapshot: LabsSnapshot,
  totalActivities: number,
) {
  const state = readStudyCourseState();

  state.labsCompleted ??= {};
  state.chTab ??= {};
  state.progress ??= {};

  state.labsCompleted[chapterSlug] = snapshot.completedIds;
  state.chTab[chapterSlug] = CHAPTER_TAB_INDEX.labs;
  state.progress[chapterSlug] = Math.max(
    state.progress[chapterSlug] ?? 0,
    computeTopicProgressPct(snapshot.completedIds.length, totalActivities),
  );

  writeStudyCourseState(state);
  void syncModuleProgress(chapterSlug, state);
}

function activityTypeLabel(activity: ChapterLabActivity) {
  switch (activity.type) {
    case 'click-match':
      return 'Click & Match';
    case 'click-order':
      return 'Click & Order';
    case 'fill-blank':
      return 'Fill in Blanks';
    case 'code-lab':
      return 'Code Lab';
    default:
      return 'Practice';
  }
}

function ClickMatchLab({
  activity,
  isComplete,
  onComplete,
}: {
  activity: ClickMatchActivity;
  isComplete: boolean;
  onComplete: (activityId: string) => void;
}) {
  const [shuffledItems, setShuffledItems] = useState(() => shuffleArray(activity.items));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [placements, setPlacements] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);

  const zoneItems = useMemo(() => {
    const grouped = Object.fromEntries(activity.categories.map((category) => [category, [] as number[]]));

    shuffledItems.forEach((_item, index) => {
      const category = placements[index];
      if (category) grouped[category]?.push(index);
    });

    return grouped;
  }, [activity.categories, placements, shuffledItems]);

  const unplacedIndices = shuffledItems
    .map((_item, index) => index)
    .filter((index) => placements[index] === undefined);

  function reset() {
    setShuffledItems(shuffleArray(activity.items));
    setSelectedIndex(null);
    setPlacements({});
    setFeedback(null);
  }

  function placeInto(category: string) {
    if (selectedIndex === null) return;

    setPlacements((current) => ({
      ...current,
      [selectedIndex]: category,
    }));
    setSelectedIndex(null);
    setFeedback(null);
  }

  function checkAnswers() {
    if (Object.keys(placements).length !== shuffledItems.length) {
      setFeedback({
        kind: 'warn',
        message: 'Place every card into a category first, then check your work.',
      });
      return;
    }

    const wrongCount = shuffledItems.reduce((count, item, index) => {
      return count + (placements[index] === item.category ? 0 : 1);
    }, 0);

    if (wrongCount === 0) {
      setFeedback({
        kind: 'success',
        message: `Perfect. All ${shuffledItems.length} cards are in the right category.`,
      });
      onComplete(activity.id);
      return;
    }

    setFeedback({
      kind: 'error',
      message: `${shuffledItems.length - wrongCount} correct, ${wrongCount} incorrect. Pull the red cards back and try again.`,
    });
  }

  return (
    <div className="stack-lg">
      <p className="panel__copy">{activity.instructions}</p>
      <div className="lab-match-bank">
        {unplacedIndices.length > 0 ? (
          unplacedIndices.map((index) => (
            <button
              key={`${activity.id}-bank-${index}`}
              type="button"
              className={`lab-token ${selectedIndex === index ? 'lab-token--selected' : ''}`}
              onClick={() => setSelectedIndex((current) => (current === index ? null : index))}
            >
              {shuffledItems[index].text}
            </button>
          ))
        ) : (
          <p className="panel__copy">All cards are placed. Review the categories below and check your work.</p>
        )}
      </div>

      <div className="lab-match-grid">
        {activity.categories.map((category) => (
          <section
            key={`${activity.id}-${category}`}
            className={`lab-match-zone ${selectedIndex !== null ? 'lab-match-zone--active' : ''}`}
            onClick={() => placeInto(category)}
          >
            <div className="lab-match-zone__label">{category}</div>
            <div className="lab-match-zone__items">
              {zoneItems[category]?.length ? (
                zoneItems[category].map((index) => {
                  const isWrong =
                    feedback?.kind === 'error' && placements[index] !== shuffledItems[index].category;
                  const isRight =
                    feedback?.kind === 'success' ||
                    (feedback?.kind === 'error' && placements[index] === shuffledItems[index].category);

                  return (
                    <button
                      key={`${activity.id}-placed-${index}`}
                      type="button"
                      className={`lab-token lab-token--placed ${isWrong ? 'lab-token--wrong' : ''} ${isRight ? 'lab-token--right' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setPlacements((current) => {
                          const next = { ...current };
                          delete next[index];
                          return next;
                        });
                        setSelectedIndex(null);
                        setFeedback(null);
                      }}
                    >
                      {shuffledItems[index].text}
                    </button>
                  );
                })
              ) : (
                <p className="panel__copy">Drop cards here.</p>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="summary-actions">
        <button type="button" className="btn-primary" onClick={checkAnswers}>
          Check answers
        </button>
        <button type="button" className="btn-ghost" onClick={reset}>
          Reset
        </button>
        {isComplete ? <span className="lab-complete-badge">Completed</span> : null}
      </div>

      {feedback ? (
        <div className={`lab-feedback-card lab-feedback-card--${feedback.kind}`}>{feedback.message}</div>
      ) : null}
    </div>
  );
}

function ClickOrderLab({
  activity,
  isComplete,
  onComplete,
}: {
  activity: ClickOrderActivity;
  isComplete: boolean;
  onComplete: (activityId: string) => void;
}) {
  const [order, setOrder] = useState(() => shuffleArray(activity.items));
  const [feedback, setFeedback] = useState<Feedback>(null);

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= order.length) return;

    setOrder((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setFeedback(null);
  }

  function reset() {
    setOrder(shuffleArray(activity.items));
    setFeedback(null);
  }

  function checkAnswers() {
    const wrongCount = order.reduce((count, item, index) => count + (item === activity.answer[index] ? 0 : 1), 0);

    if (wrongCount === 0) {
      setFeedback({
        kind: 'success',
        message: activity.explanation
          ? `Correct order. ${activity.explanation}`
          : 'Correct order. Everything is in the right sequence.',
      });
      onComplete(activity.id);
      return;
    }

    setFeedback({
      kind: 'error',
      message: activity.explanation
        ? `${order.length - wrongCount}/${order.length} items are in the right position. ${activity.explanation}`
        : `${order.length - wrongCount}/${order.length} items are in the right position. Keep adjusting.`,
    });
  }

  return (
    <div className="stack-lg">
      <p className="panel__copy">{activity.instructions}</p>
      <div className="lab-order-list">
        {order.map((item, index) => {
          const isRight =
            feedback && (feedback.kind === 'success' || activity.answer[index] === item);
          const isWrong = feedback?.kind === 'error' && activity.answer[index] !== item;

          return (
            <article
              key={`${activity.id}-order-${item}-${index}`}
              className={`lab-order-item ${isRight ? 'lab-order-item--right' : ''} ${isWrong ? 'lab-order-item--wrong' : ''}`}
            >
              <span className="lab-order-item__index">{index + 1}</span>
              <span className="lab-order-item__text">{item}</span>
              <div className="lab-order-item__actions">
                <button type="button" className="btn-ghost" onClick={() => move(index, -1)} disabled={index === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                >
                  ↓
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="summary-actions">
        <button type="button" className="btn-primary" onClick={checkAnswers}>
          Check order
        </button>
        <button type="button" className="btn-ghost" onClick={reset}>
          Shuffle again
        </button>
        {isComplete ? <span className="lab-complete-badge">Completed</span> : null}
      </div>

      {feedback ? (
        <div className={`lab-feedback-card lab-feedback-card--${feedback.kind}`}>{feedback.message}</div>
      ) : null}
    </div>
  );
}

function FillBlankLab({
  activity,
  isComplete,
  onComplete,
}: {
  activity: FillBlankActivity;
  isComplete: boolean;
  onComplete: (activityId: string) => void;
}) {
  const [answers, setAnswers] = useState<string[]>(() => activity.questions.map(() => ''));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, string>>({});

  function reset() {
    setAnswers(activity.questions.map(() => ''));
    setFeedback(null);
    setRevealedAnswers({});
  }

  function checkAnswers() {
    const nextRevealedAnswers: Record<number, string> = {};
    let correctCount = 0;

    activity.questions.forEach((question, index) => {
      const normalizedAnswer = answers[index]?.trim().toLowerCase() ?? '';
      if (normalizedAnswer === question.answer.trim().toLowerCase()) {
        correctCount += 1;
        return;
      }

      nextRevealedAnswers[index] = question.answer;
    });

    setRevealedAnswers(nextRevealedAnswers);

    if (correctCount === activity.questions.length) {
      setFeedback({
        kind: 'success',
        message: `All ${correctCount} blanks are correct. Nice work.`,
      });
      onComplete(activity.id);
      return;
    }

    setFeedback({
      kind: 'error',
      message: `${correctCount}/${activity.questions.length} correct. The missed answers are shown below each prompt.`,
    });
  }

  return (
    <div className="stack-lg">
      <p className="panel__copy">{activity.instructions}</p>
      <div className="lab-fill-list">
        {activity.questions.map((question, index) => {
          const isCorrect =
            answers[index]?.trim().toLowerCase() === question.answer.trim().toLowerCase() &&
            answers[index].trim().length > 0;

          return (
            <article key={`${activity.id}-question-${index}`} className="lab-fill-item">
              <label className="lab-fill-item__prompt" htmlFor={`${activity.id}-input-${index}`}>
                {question.prompt.replace('_____', '').trim()}
              </label>
              <input
                id={`${activity.id}-input-${index}`}
                className={`lab-fill-item__input ${isCorrect ? 'lab-fill-item__input--right' : revealedAnswers[index] ? 'lab-fill-item__input--wrong' : ''}`}
                value={answers[index]}
                onChange={(event) => {
                  const value = event.target.value;
                  setAnswers((current) => current.map((entry, entryIndex) => (entryIndex === index ? value : entry)));
                }}
                placeholder="Type the answer"
                autoComplete="off"
                spellCheck={false}
              />
              {revealedAnswers[index] ? (
                <p className="lab-fill-item__answer">Answer: {revealedAnswers[index]}</p>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="summary-actions">
        <button type="button" className="btn-primary" onClick={checkAnswers}>
          Check all
        </button>
        <button type="button" className="btn-ghost" onClick={reset}>
          Reset
        </button>
        {isComplete ? <span className="lab-complete-badge">Completed</span> : null}
      </div>

      {feedback ? (
        <div className={`lab-feedback-card lab-feedback-card--${feedback.kind}`}>{feedback.message}</div>
      ) : null}
    </div>
  );
}

function CodeLabViewer({
  activity,
  isComplete,
  notebookHref,
  onComplete,
}: {
  activity: CodeLabActivity;
  isComplete: boolean;
  notebookHref: string | null;
  onComplete: (activityId: string) => void;
}) {
  const codeCells = activity.cells.filter((cell): cell is Extract<CodeLabActivity['cells'][number], { type: 'code' }> => cell.type === 'code');
  const markdownCells = activity.cells.filter((cell): cell is Extract<CodeLabActivity['cells'][number], { type: 'markdown' }> => cell.type === 'markdown');
  const [activeIndex, setActiveIndex] = useState(0);
  const [drafts, setDrafts] = useState(() => codeCells.map((cell) => cell.code));
  const [copied, setCopied] = useState(false);

  const activeInstruction = markdownCells[activeIndex]?.content ?? '';

  async function copyCurrentCell() {
    const currentCode = drafts[activeIndex] ?? '';

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  function resetCurrentCell() {
    setDrafts((current) =>
      current.map((entry, index) => (index === activeIndex ? codeCells[index]?.code ?? entry : entry)),
    );
  }

  return (
    <div className="stack-lg">
      <p className="panel__copy">{activity.instructions}</p>
      {activity.objectives?.length ? (
        <div className="lab-code-objectives">
          <p className="eyebrow">Objectives</p>
          <ul className="lab-code-objectives__list">
            {activity.objectives.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="lab-code-note">
        <p className="lab-code-note__title">How to use this code lab</p>
        <ol className="lab-code-note__steps">
          <li>Read the exercise box above the editor — it updates when you switch tabs.</li>
          <li>Edit the sample if you want, then run it in your own Python environment or in the full study site, which can execute cells in the browser or via Docker.</li>
          <li>
            When this chapter lists a notebook, use <strong>Download notebook</strong> to open the same exercises in Jupyter.
          </li>
          <li>Click <strong>Mark reviewed</strong> when you have worked through the examples.</li>
        </ol>
        <p className="lab-code-note__aside">
          This Next.js page does not run Python itself; use copy/run locally, the notebook, or the static study app for execution.
        </p>
      </div>

      {codeCells.length > 1 ? (
        <div className="route-chip-row">
          {codeCells.map((_cell, index) => (
            <button
              key={`${activity.id}-tab-${index}`}
              type="button"
              className={`route-chip ${index === activeIndex ? 'route-chip--active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {index === 0 ? 'setup.py' : `exercise_${index}.py`}
            </button>
          ))}
        </div>
      ) : null}

      {activeInstruction ? (
        <div
          className="topic-keybox"
          dangerouslySetInnerHTML={{ __html: activeInstruction }}
        />
      ) : null}

      <textarea
        className="lab-code-editor"
        value={drafts[activeIndex] ?? ''}
        onChange={(event) => {
          const value = event.target.value;
          setDrafts((current) => current.map((entry, index) => (index === activeIndex ? value : entry)));
        }}
        spellCheck={false}
      />

      <div className="summary-actions">
        <button type="button" className="btn-primary" onClick={() => onComplete(activity.id)}>
          {isComplete ? 'Reviewed' : 'Mark reviewed'}
        </button>
        <button type="button" className="btn-ghost" onClick={copyCurrentCell}>
          {copied ? 'Copied' : 'Copy code'}
        </button>
        <button type="button" className="btn-ghost" onClick={resetCurrentCell}>
          Reset current cell
        </button>
        {notebookHref ? (
          <Link href={notebookHref} className="btn-ghost">
            Download notebook
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function LabActivityCard({
  activity,
  isComplete,
  notebookHref,
  onComplete,
}: {
  activity: ChapterLabActivity;
  isComplete: boolean;
  notebookHref: string | null;
  onComplete: (activityId: string) => void;
}) {
  return (
    <article className="lab-card-shell">
      <div className="lab-card-shell__header">
        <div>
          <p className="eyebrow">Lab activity</p>
          <h3>{activity.title}</h3>
        </div>
        <div className="lab-card-shell__badges">
          <span className="route-chip route-chip--active">{activityTypeLabel(activity)}</span>
          {isComplete ? <span className="lab-complete-badge">Completed</span> : null}
        </div>
      </div>

      <div className="lab-card-shell__meta">
        <div>
          <span className="summary-card__label">Mode</span>
          <strong>{activity.type}</strong>
        </div>
        <div>
          <span className="summary-card__label">Status</span>
          <strong>{isComplete ? 'Done' : 'Ready'}</strong>
        </div>
      </div>

      {activity.type === 'click-match' ? (
        <ClickMatchLab activity={activity} isComplete={isComplete} onComplete={onComplete} />
      ) : null}
      {activity.type === 'click-order' ? (
        <ClickOrderLab activity={activity} isComplete={isComplete} onComplete={onComplete} />
      ) : null}
      {activity.type === 'fill-blank' ? (
        <FillBlankLab activity={activity} isComplete={isComplete} onComplete={onComplete} />
      ) : null}
      {activity.type === 'code-lab' ? (
        <CodeLabViewer
          activity={activity}
          isComplete={isComplete}
          notebookHref={notebookHref}
          onComplete={onComplete}
        />
      ) : null}
    </article>
  );
}

export function ChapterLabsWorkspace({
  chapterSlug,
  chapterTitle,
  labDefinition,
}: ChapterLabsWorkspaceProps) {
  const [snapshot, setSnapshot] = useState<LabsSnapshot | null>(null);

  useEffect(() => {
    const initialSnapshot = readLabsSnapshot(chapterSlug);
    setSnapshot(initialSnapshot);
    persistLabsSnapshot(chapterSlug, initialSnapshot, labDefinition.activities.length);
  }, [chapterSlug, labDefinition.activities.length]);

  if (!snapshot) {
    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Labs</p>
            <h3>Loading chapter labs</h3>
          </div>
        </div>
      </section>
    );
  }

  const activeSnapshot = snapshot;
  const coveragePct = labDefinition.activities.length
    ? Math.round((activeSnapshot.completedIds.length / labDefinition.activities.length) * 100)
    : 0;
  const notebookHref = labDefinition.notebook
    ? `/notebooks/${labDefinition.notebook.filename}`
    : null;

  function markComplete(activityId: string) {
    const completedIds = activeSnapshot.completedIds.includes(activityId)
      ? activeSnapshot.completedIds
      : [...activeSnapshot.completedIds, activityId].sort();
    const nextSnapshot = { completedIds };

    setSnapshot(nextSnapshot);
    persistLabsSnapshot(chapterSlug, nextSnapshot, labDefinition.activities.length);
  }

  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Practice labs</p>
            <h3>{chapterTitle} hands-on workspace</h3>
          </div>
          <div className="quiz-stat-grid">
            <div className="quiz-stat">
              <span className="quiz-stat__label">Activities</span>
              <strong>{labDefinition.activities.length}</strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Completed</span>
              <strong>{activeSnapshot.completedIds.length}</strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Coverage</span>
              <strong>{coveragePct}%</strong>
            </div>
          </div>
        </div>
        <p className="panel__copy">
          Interactive drills are available here directly, while the notebook and code path stays
          available for deeper hands-on work.
        </p>
        <div className="topic-progress">
          <div className="topic-progress__bar">
            <div className="topic-progress__fill" style={{ width: `${coveragePct}%` }} />
          </div>
          <span>{activeSnapshot.completedIds.length} of {labDefinition.activities.length} activities completed</span>
        </div>
      </section>

      {labDefinition.notebook ? (
        <section className="panel notebook-callout">
          <div>
            <p className="eyebrow">Notebook</p>
            <h3>{labDefinition.notebook.title}</h3>
            <p className="panel__copy">
              This chapter ships with a companion Jupyter notebook. You can download it directly
              from this route for offline or notebook-based practice.
            </p>
          </div>
          {notebookHref ? (
            <Link href={notebookHref} className="btn-primary">
              Download notebook
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="stack-xl">
        {labDefinition.activities.map((activity) => (
          <LabActivityCard
            key={activity.id}
            activity={activity}
            isComplete={activeSnapshot.completedIds.includes(activity.id)}
            notebookHref={notebookHref}
            onComplete={markComplete}
          />
        ))}
      </section>
    </div>
  );
}
