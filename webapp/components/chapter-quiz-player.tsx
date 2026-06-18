'use client';

import { useEffect, useRef, useState } from 'react';

import type { ChapterQuizQuestion } from '../lib/chapter-quiz-bank';
import type { ChapterSlug } from '../lib/course-data';
import { STUDY_BUDDY_OPEN_EVENT } from '../lib/study-buddy-events';
import { CLIENT_CHAT_FETCH_TIMEOUT_MS } from '../lib/chat-limits';
import { consumeOllamaSseText } from '../lib/read-ollama-sse';
import { toFriendlyAiErrorMessage } from '../lib/user-facing-error';

const STUDY_STATE_KEY = 'secaiplus_state';
const AUTH_TOKEN_KEY = 'sb_token';
const COURSE_SLUG = 'secaiplus';
const QUIZ_TAB_INDEX = 4;
const PASSING_SCORE = 70;
const API_BASE_URL = process.env.NEXT_PUBLIC_SB_API_URL ?? 'http://localhost:3001';

type StudyCourseState = {
  progress?: Record<string, number>;
  notes?: Record<string, string>;
  topicsSeen?: Record<string, string[]>;
  topicCurrent?: Record<string, number>;
  fcIndex?: Record<string, number>;
  chTab?: Record<string, number>;
  quizIndex?: Record<string, number>;
  quizAnswered?: Record<string, number | null>;
  quizPerAnswer?: Record<string, Array<number | null>>;
  quizScore?: Record<string, number>;
  quizCorrect?: Record<string, number>;
  quizAttempted?: Record<string, number>;
};

type QuizSnapshot = {
  currentIndex: number;
  currentAnswer: number | null;
  answerHistory: Array<number | null>;
  correctCount: number;
  attemptedCount: number;
  score: number;
  isComplete: boolean;
};

type ChapterQuizPlayerProps = {
  chapterSlug: ChapterSlug;
  chapterTitle: string;
  questions: ChapterQuizQuestion[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function openStudyBuddyPopup() {
  window.dispatchEvent(new CustomEvent(STUDY_BUDDY_OPEN_EVENT));
}

function readStudyState(): StudyCourseState {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(STUDY_STATE_KEY) || '{}') as StudyCourseState;
  } catch {
    return {};
  }
}

function writeStudyState(state: StudyCourseState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STUDY_STATE_KEY, JSON.stringify(state));
}

function emptyAnswerHistory(totalQuestions: number) {
  return Array.from({ length: totalQuestions }, () => null as number | null);
}

function normalizeAnswerHistory(
  answers: Array<number | null> | undefined,
  totalQuestions: number,
) {
  const normalized = emptyAnswerHistory(totalQuestions);

  if (!Array.isArray(answers)) return normalized;

  for (let index = 0; index < totalQuestions; index += 1) {
    const value = answers[index];
    normalized[index] = typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  return normalized;
}

function createEmptySnapshot(totalQuestions: number): QuizSnapshot {
  return {
    currentIndex: 0,
    currentAnswer: null,
    answerHistory: emptyAnswerHistory(totalQuestions),
    correctCount: 0,
    attemptedCount: 0,
    score: 0,
    isComplete: false,
  };
}

function readSnapshot(
  chapterSlug: ChapterSlug,
  questions: ChapterQuizQuestion[],
): QuizSnapshot {
  const totalQuestions = questions.length;
  const studyState = readStudyState();
  const answerHistory = normalizeAnswerHistory(
    studyState.quizPerAnswer?.[chapterSlug],
    totalQuestions,
  );

  const correctFromHistory = answerHistory.filter(
    (answer, index) => answer !== null && answer === questions[index]?.ans,
  ).length;
  const attemptedFromHistory = answerHistory.filter((answer) => answer !== null).length;
  const storedIndex = Number(studyState.quizIndex?.[chapterSlug] ?? 0);
  const currentIndex = clamp(
    Number.isFinite(storedIndex) ? storedIndex : 0,
    0,
    totalQuestions,
  );
  const storedAnswer = studyState.quizAnswered?.[chapterSlug];
  const currentAnswer =
    currentIndex >= totalQuestions
      ? null
      : typeof storedAnswer === 'number' && Number.isFinite(storedAnswer)
        ? storedAnswer
        : answerHistory[currentIndex];
  const correctCount = Number(studyState.quizCorrect?.[chapterSlug] ?? correctFromHistory);
  const attemptedCount = Number(studyState.quizAttempted?.[chapterSlug] ?? attemptedFromHistory);
  const score =
    attemptedCount > 0
      ? Number(studyState.quizScore?.[chapterSlug] ?? Math.round((correctCount / attemptedCount) * 100))
      : 0;

  return {
    currentIndex,
    currentAnswer: typeof currentAnswer === 'number' ? currentAnswer : null,
    answerHistory,
    correctCount: Number.isFinite(correctCount) ? correctCount : 0,
    attemptedCount: Number.isFinite(attemptedCount) ? attemptedCount : 0,
    score: Number.isFinite(score) ? score : 0,
    isComplete: currentIndex >= totalQuestions,
  };
}

function buildAnswerPayload(questions: ChapterQuizQuestion[], snapshot: QuizSnapshot) {
  return questions.map((question, index) => {
    const selectedIndex = snapshot.answerHistory[index];

    return {
      question: question.q,
      selected_index: selectedIndex,
      selected_label: selectedIndex === null ? null : optionLetter(selectedIndex),
      selected_text:
        selectedIndex === null ? null : question.opts[selectedIndex] ?? null,
      correct_index: question.ans,
      correct_label: optionLetter(question.ans),
      correct_text: question.opts[question.ans] ?? null,
      is_correct: selectedIndex === question.ans,
    };
  });
}

function persistSnapshot(
  chapterSlug: ChapterSlug,
  snapshot: QuizSnapshot,
): StudyCourseState {
  const studyState = readStudyState();

  studyState.quizIndex ??= {};
  studyState.quizAnswered ??= {};
  studyState.quizPerAnswer ??= {};
  studyState.quizScore ??= {};
  studyState.quizCorrect ??= {};
  studyState.quizAttempted ??= {};
  studyState.chTab ??= {};

  studyState.quizIndex[chapterSlug] = snapshot.currentIndex;
  studyState.quizAnswered[chapterSlug] = snapshot.currentAnswer;
  studyState.quizPerAnswer[chapterSlug] = snapshot.answerHistory;
  studyState.quizScore[chapterSlug] = snapshot.score;
  studyState.quizCorrect[chapterSlug] = snapshot.correctCount;
  studyState.quizAttempted[chapterSlug] = snapshot.attemptedCount;
  studyState.chTab[chapterSlug] = QUIZ_TAB_INDEX;

  writeStudyState(studyState);
  return studyState;
}

async function syncProgressToApi(chapterSlug: ChapterSlug, state: StudyCourseState) {
  if (typeof window === 'undefined') return;

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/api/progress/${COURSE_SLUG}/${chapterSlug}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress_pct: state.progress?.[chapterSlug] ?? 0,
        active_tab: state.chTab?.[chapterSlug] ?? QUIZ_TAB_INDEX,
        topics_seen: state.topicsSeen?.[chapterSlug] ?? [],
        topic_current: state.topicCurrent?.[chapterSlug] ?? 0,
        flashcard_index: state.fcIndex?.[chapterSlug] ?? 0,
        quiz_index: state.quizIndex?.[chapterSlug] ?? 0,
        quiz_score: state.quizScore?.[chapterSlug] ?? 0,
        quiz_correct: state.quizCorrect?.[chapterSlug] ?? 0,
        quiz_attempted: state.quizAttempted?.[chapterSlug] ?? 0,
        notes_text: state.notes?.[chapterSlug] ?? null,
      }),
    });
  } catch {
    // Best-effort sync only. Local state remains the source of truth for now.
  }
}

async function recordQuizAttempt(
  chapterSlug: ChapterSlug,
  questions: ChapterQuizQuestion[],
  snapshot: QuizSnapshot,
) {
  if (typeof window === 'undefined') return;

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/api/quiz/attempts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_slug: COURSE_SLUG,
        module_slug: chapterSlug,
        quiz_type: 'chapter',
        mode: 'training',
        question_count: questions.length,
        correct_count: snapshot.correctCount,
        score: snapshot.score,
        answer_json: buildAnswerPayload(questions, snapshot),
      }),
    });
  } catch {
    // Fire-and-forget; this should not block quiz completion.
  }
}

export function ChapterQuizPlayer({
  chapterSlug,
  chapterTitle,
  questions,
}: ChapterQuizPlayerProps) {
  const [snapshot, setSnapshot] = useState<QuizSnapshot | null>(null);
  const [liveAiText, setLiveAiText] = useState('');
  const [liveAiLoading, setLiveAiLoading] = useState(false);
  const [liveAiError, setLiveAiError] = useState<string | null>(null);
  const [reviewAiText, setReviewAiText] = useState<Record<number, string>>({});
  const [reviewAiLoading, setReviewAiLoading] = useState<Record<number, boolean>>({});
  const [reviewAiError, setReviewAiError] = useState<Record<number, string | null>>({});
  const [liveExplainRetryKey, setLiveExplainRetryKey] = useState(0);
  const liveExplainGen = useRef(0);

  useEffect(() => {
    setSnapshot(readSnapshot(chapterSlug, questions));
  }, [chapterSlug, questions]);

  useEffect(() => {
    if (!snapshot || snapshot.isComplete || snapshot.currentAnswer === null) {
      setLiveAiText('');
      setLiveAiLoading(false);
      setLiveAiError(null);
      return;
    }

    const qIndex = snapshot.currentIndex;
    const question = questions[qIndex];
    if (!question) {
      return;
    }

    const selectedIndex = snapshot.currentAnswer;
    const ac = new AbortController();
    const gen = ++liveExplainGen.current;

    setLiveAiText('');
    setLiveAiLoading(true);
    setLiveAiError(null);

    (async () => {
      try {
        const response = await fetch('/api/quiz/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.any([ac.signal, AbortSignal.timeout(CLIENT_CHAT_FETCH_TIMEOUT_MS)]),
          body: JSON.stringify({
            question: question.q,
            options: question.opts,
            selectedIndex,
            correctIndex: question.ans,
            chapterSlug,
            staticExplanation: question.exp,
          }),
        });

        await consumeOllamaSseText(response, (chunk) => {
          if (liveExplainGen.current === gen) {
            setLiveAiText((previous) => `${previous}${chunk}`);
          }
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        if (liveExplainGen.current === gen) {
          const raw =
            error instanceof Error
              ? error.name === 'TimeoutError'
                ? 'TimeoutError'
                : error.message
              : 'Could not load an AI explanation. Check that Ollama is running.';
          setLiveAiError(toFriendlyAiErrorMessage(raw));
        }
      } finally {
        if (liveExplainGen.current === gen) {
          setLiveAiLoading(false);
        }
      }
    })();

    return () => {
      ac.abort();
    };
  }, [
    chapterSlug,
    questions,
    snapshot?.currentAnswer,
    snapshot?.currentIndex,
    snapshot?.isComplete,
    liveExplainRetryKey,
  ]);

  async function fetchReviewExplanation(questionIndex: number) {
    const question = questions[questionIndex];
    const selectedIndex = snapshot?.answerHistory[questionIndex];
    if (!question || selectedIndex === null || selectedIndex === undefined) {
      return;
    }

    setReviewAiLoading((previous) => ({ ...previous, [questionIndex]: true }));
    setReviewAiError((previous) => ({ ...previous, [questionIndex]: null }));
    setReviewAiText((previous) => ({ ...previous, [questionIndex]: '' }));

    try {
      const response = await fetch('/api/quiz/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(CLIENT_CHAT_FETCH_TIMEOUT_MS),
        body: JSON.stringify({
          question: question.q,
          options: question.opts,
          selectedIndex,
          correctIndex: question.ans,
          chapterSlug,
          staticExplanation: question.exp,
        }),
      });

      await consumeOllamaSseText(response, (chunk) => {
        setReviewAiText((previous) => ({
          ...previous,
          [questionIndex]: `${previous[questionIndex] ?? ''}${chunk}`,
        }));
      });
    } catch (error) {
      const raw =
        error instanceof Error
          ? error.name === 'TimeoutError'
            ? 'TimeoutError'
            : error.message
          : 'Could not load an AI explanation. Check that Ollama is running.';
      setReviewAiError((previous) => ({
        ...previous,
        [questionIndex]: toFriendlyAiErrorMessage(raw),
      }));
    } finally {
      setReviewAiLoading((previous) => ({ ...previous, [questionIndex]: false }));
    }
  }

  function commitSnapshot(nextSnapshot: QuizSnapshot, options?: { recordAttempt?: boolean }) {
    setSnapshot(nextSnapshot);
    const studyState = persistSnapshot(chapterSlug, nextSnapshot);
    void syncProgressToApi(chapterSlug, studyState);

    if (options?.recordAttempt) {
      void recordQuizAttempt(chapterSlug, questions, nextSnapshot);
    }
  }

  function handleAnswer(selectedIndex: number) {
    if (!snapshot || snapshot.isComplete || snapshot.currentAnswer !== null) return;

    const currentQuestion = questions[snapshot.currentIndex];
    const answerHistory = [...snapshot.answerHistory];
    answerHistory[snapshot.currentIndex] = selectedIndex;

    const correctCount =
      snapshot.correctCount + (selectedIndex === currentQuestion.ans ? 1 : 0);
    const attemptedCount = snapshot.attemptedCount + 1;

    setLiveAiText('');
    setLiveAiError(null);
    setLiveAiLoading(true);

    commitSnapshot({
      ...snapshot,
      currentAnswer: selectedIndex,
      answerHistory,
      correctCount,
      attemptedCount,
      score: Math.round((correctCount / attemptedCount) * 100),
    });
  }

  function handleNext() {
    if (!snapshot || snapshot.currentAnswer === null || snapshot.isComplete) return;

    const nextIndex = snapshot.currentIndex + 1;
    const isComplete = nextIndex >= questions.length;

    commitSnapshot(
      {
        ...snapshot,
        currentIndex: isComplete ? questions.length : nextIndex,
        currentAnswer: null,
        isComplete,
      },
      { recordAttempt: isComplete },
    );
  }

  function handleRetake() {
    setReviewAiText({});
    setReviewAiLoading({});
    setReviewAiError({});
    commitSnapshot(createEmptySnapshot(questions.length));
  }

  if (!snapshot) {
    return (
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Chapter quiz</p>
            <h3>Loading saved quiz state</h3>
          </div>
        </div>
        <p className="panel__copy">
          Restoring your saved progress for {chapterTitle} from your shared study state.
        </p>
      </section>
    );
  }

  const currentQuestion = snapshot.isComplete ? null : questions[snapshot.currentIndex];
  const answeredIndex = snapshot.currentAnswer;
  const answeredCorrectly =
    currentQuestion && answeredIndex !== null ? answeredIndex === currentQuestion.ans : false;
  const passing = snapshot.score >= PASSING_SCORE;
  const resumeLabel =
    snapshot.isComplete || snapshot.attemptedCount === 0
      ? null
      : `Resume question ${snapshot.currentIndex + 1} of ${questions.length}.`;

  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Real feature flow</p>
            <h3>{chapterTitle} quiz</h3>
          </div>
          <div className="quiz-stat-grid">
            <div className="quiz-stat">
              <span className="quiz-stat__label">Score</span>
              <strong>{snapshot.score}%</strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Correct</span>
              <strong>
                {snapshot.correctCount}/{questions.length}
              </strong>
            </div>
            <div className="quiz-stat">
              <span className="quiz-stat__label">Status</span>
              <strong>{snapshot.isComplete ? (passing ? 'Passed' : 'Review') : 'In progress'}</strong>
            </div>
          </div>
        </div>
        <p className="panel__copy">
          This quiz saves your place in the shared study state and resumes exactly where you left
          off.
        </p>
        {resumeLabel ? <p className="quiz-resume">{resumeLabel}</p> : null}
      </section>

      {!snapshot.isComplete && currentQuestion ? (
        <section className="quiz-card">
          <div className="quiz-card__header">
            <span className="quiz-card__badge">
              Question {snapshot.currentIndex + 1} of {questions.length}
            </span>
            <div className="quiz-card__header-actions">
              <button type="button" className="btn-ghost" onClick={openStudyBuddyPopup}>
                Ask Study Buddy
              </button>
              <button type="button" className="btn-ghost" onClick={handleRetake}>
                Restart quiz
              </button>
            </div>
          </div>

          <h3 className="quiz-question">{currentQuestion.q}</h3>

          <div className="quiz-options">
            {currentQuestion.opts.map((option, index) => {
              const answered = answeredIndex !== null;
              const isCorrectOption = currentQuestion.ans === index;
              const isWrongSelection = answeredIndex === index && !isCorrectOption;
              const stateClass = !answered
                ? ''
                : isCorrectOption
                  ? 'quiz-option--correct'
                  : isWrongSelection
                    ? 'quiz-option--wrong'
                    : 'quiz-option--muted';

              return (
                <button
                  key={`${chapterSlug}-${snapshot.currentIndex}-${index}`}
                  type="button"
                  className={`quiz-option ${stateClass}`.trim()}
                  disabled={answered}
                  onClick={() => handleAnswer(index)}
                >
                  <span className="quiz-option__label">{optionLetter(index)}.</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {answeredIndex !== null ? (
            <div className="quiz-feedback-stack">
              <div
                className={`quiz-feedback ${
                  answeredCorrectly ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'
                }`}
              >
                <strong>{answeredCorrectly ? 'Correct.' : 'Not quite.'}</strong>{' '}
                {currentQuestion.exp}
              </div>

              <div className="quiz-ai-explain" aria-live="polite">
                <p className="quiz-ai-explain__eyebrow">Quick-learn</p>
                {liveAiLoading ? (
                  <p className="quiz-ai-explain__status">Generating quick-learn summary…</p>
                ) : null}
                {liveAiError ? (
                  <div className="quiz-ai-explain__error-row">
                    <p className="quiz-ai-explain__error">{liveAiError}</p>
                    <button
                      type="button"
                      className="btn-ghost quiz-ai-explain__action"
                      onClick={() => setLiveExplainRetryKey((key) => key + 1)}
                    >
                      Retry
                    </button>
                  </div>
                ) : null}
                {liveAiText ? (
                  <div className="quiz-ai-explain__body">{liveAiText}</div>
                ) : null}
                {!liveAiLoading && !liveAiError && !liveAiText ? (
                  <p className="quiz-ai-explain__muted">
                    No AI text was returned. Use the course explanation above, or run Ollama with your
                    configured model for quick-learn sections (RIGHT ANSWER, MEMORY HOOK, EXAM TIP, etc.).
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="quiz-card__footer">
            <span className="quiz-card__progress">
              {snapshot.attemptedCount} answered so far
            </span>
            {answeredIndex !== null ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                {snapshot.currentIndex === questions.length - 1 ? 'Finish quiz' : 'Next question'}
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="quiz-results">
          <div className="quiz-results__hero">
            <span className={`quiz-results__badge ${passing ? 'quiz-results__badge--pass' : 'quiz-results__badge--review'}`}>
              {passing ? 'Passed' : 'Needs review'}
            </span>
            <h3>
              {snapshot.correctCount} of {questions.length} correct
            </h3>
            <p className="panel__copy">
              You finished the {chapterTitle} chapter quiz with a {snapshot.score}% score.
              {passing
                ? ' This chapter is in good shape.'
                : ` Aim for ${PASSING_SCORE}% or better on the retake.`}
            </p>
            <div className="quiz-results__actions">
              <button type="button" className="btn-ghost" onClick={openStudyBuddyPopup}>
                Ask Study Buddy
              </button>
              <button type="button" className="btn-primary" onClick={handleRetake}>
                Retake chapter quiz
              </button>
            </div>
          </div>

          <div className="quiz-review-list">
            {questions.map((question, index) => {
              const selectedIndex = snapshot.answerHistory[index];
              const isCorrect = selectedIndex === question.ans;

              return (
                <article
                  key={`${chapterSlug}-review-${index}`}
                  className={`quiz-review-item ${
                    isCorrect ? 'quiz-review-item--correct' : 'quiz-review-item--wrong'
                  }`}
                >
                  <div className="quiz-review-item__header">
                    <span className="quiz-review-item__number">Q{index + 1}</span>
                    <span className="quiz-review-item__status">
                      {isCorrect ? 'Correct' : 'Review this one'}
                    </span>
                  </div>
                  <h4>{question.q}</h4>
                  <p>
                    <strong>Your answer:</strong>{' '}
                    {selectedIndex === null
                      ? 'No answer recorded'
                      : `${optionLetter(selectedIndex)}. ${question.opts[selectedIndex] ?? 'Unavailable option'}`}
                  </p>
                  {!isCorrect ? (
                    <p>
                      <strong>Correct answer:</strong> {optionLetter(question.ans)}.{' '}
                      {question.opts[question.ans] ?? 'Unavailable option'}
                    </p>
                  ) : null}
                  <p>{question.exp}</p>

                  <div className="quiz-ai-explain quiz-ai-explain--compact">
                    <p className="quiz-ai-explain__eyebrow">Quick-learn</p>
                    {reviewAiLoading[index] ? (
                      <p className="quiz-ai-explain__status">Generating quick-learn summary…</p>
                    ) : null}
                    {reviewAiError[index] ? (
                      <p className="quiz-ai-explain__error">{reviewAiError[index]}</p>
                    ) : null}
                    {reviewAiText[index] ? (
                      <div className="quiz-ai-explain__body">{reviewAiText[index]}</div>
                    ) : null}
                    <button
                      type="button"
                      className="btn-ghost quiz-ai-explain__action"
                      disabled={Boolean(reviewAiLoading[index]) || selectedIndex === null}
                      onClick={() => void fetchReviewExplanation(index)}
                    >
                      {reviewAiLoading[index]
                        ? 'Loading…'
                        : reviewAiText[index]
                          ? 'Regenerate AI explanation'
                          : 'Get AI explanation'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
