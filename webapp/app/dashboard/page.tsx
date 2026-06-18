import Link from 'next/link';

import { ChapterCard } from '../../components/chapter-card';
import { StatCard } from '../../components/stat-card';
import { appMeta, chapters } from '../../lib/course-data';
import { getQuizBankSummary } from '../../lib/quiz-bank';

export default async function DashboardPage() {
  const summary = await getQuizBankSummary();

  return (
    <div className="stack-xl">
      <section className="hero">
        <p className="eyebrow">Overview</p>
        <h2>{appMeta.title}</h2>
        <p className="hero__copy">{appMeta.subtitle}</p>
      </section>

      <section className="grid-stats">
        <StatCard label="Chapters" value={String(chapters.length)} tone="primary" />
        <StatCard label="Quiz Questions" value={String(summary.totalQuestions)} tone="accent" />
        <StatCard label="Question Topics" value={String(summary.topicCount)} />
        <StatCard label="Multi-select Items" value={String(summary.multiSelectCount)} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Platform status</p>
            <h3>What is available now</h3>
          </div>
        </div>
        <div className="migration-list">
          <div className="migration-item">
            <strong>Study chapters are live.</strong>
            <span>Topics, scenarios, labs, flashcards, quizzes, and summaries are all available from the chapter routes.</span>
          </div>
          <div className="migration-item">
            <strong>Real question-bank counts are wired in.</strong>
            <span>This dashboard reads the full quiz bank instead of placeholder metrics.</span>
          </div>
          <div className="migration-item">
            <strong>AI study help is built in.</strong>
            <span>Open <code>/ai</code> for local Ollama chat with optional chapter-aware context.</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">AI study help</p>
            <h3>Open the local tutor</h3>
          </div>
          <Link href="/ai" className="topbar__button">
            Open AI Chat
          </Link>
        </div>
        <p className="panel__copy">
          Use the AI route for local Ollama chat, streaming responses, and optional chapter-aware
          context grounded in your study materials.
        </p>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Study map</p>
            <h3>All chapters</h3>
          </div>
        </div>
        <div className="chapter-grid">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} />
          ))}
        </div>
      </section>
    </div>
  );
}
