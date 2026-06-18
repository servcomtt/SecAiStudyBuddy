import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ChapterFlashcardsViewer } from '../../../../components/chapter-flashcards-viewer';
import { ChapterLabsWorkspace } from '../../../../components/chapter-labs-workspace';
import { ChapterQuizPlayer } from '../../../../components/chapter-quiz-player';
import { ChapterScenariosViewer } from '../../../../components/chapter-scenarios-viewer';
import { ChapterSummaryPanel } from '../../../../components/chapter-summary-panel';
import { ChapterTopicsViewer } from '../../../../components/chapter-topics-viewer';
import { getChapterLabDefinition } from '../../../../lib/chapter-lab-bank';
import { getChapterQuizDeck } from '../../../../lib/chapter-quiz-bank';
import {
  getChapterFlashcards,
  getChapterScenarios,
  getChapterTopics,
} from '../../../../lib/chapter-study-bank';
import { chapters, getChapter, getStep, steps } from '../../../../lib/course-data';

type ChapterSectionPageProps = {
  params: Promise<{
    chapter: string;
    section: string;
  }>;
};

export function generateStaticParams() {
  return chapters.flatMap((chapter) =>
    steps.map((step) => ({
      chapter: chapter.slug,
      section: step.id,
    })),
  );
}

export default async function ChapterSectionPage({ params }: ChapterSectionPageProps) {
  const { chapter: chapterSlug, section: sectionSlug } = await params;
  const chapter = getChapter(chapterSlug);

  if (!chapter) notFound();

  const section = getStep(sectionSlug);

  if (!section) notFound();

  const normalizedSectionId =
    section.id === 'acronyms'
      ? 'flashcards'
      : section.id === 'terminology'
        ? 'topics'
        : section.id === 'practice-quiz'
          ? 'quiz'
          : section.id;

  const chapterTopics =
    normalizedSectionId === 'topics' || normalizedSectionId === 'summary'
      ? await getChapterTopics(chapter.slug)
      : null;
  const chapterScenarios =
    normalizedSectionId === 'scenarios' || normalizedSectionId === 'summary'
      ? await getChapterScenarios(chapter.slug)
      : null;
  const chapterLabDefinition =
    normalizedSectionId === 'labs' || normalizedSectionId === 'summary'
      ? await getChapterLabDefinition(chapter.slug)
      : null;
  const chapterFlashcards =
    normalizedSectionId === 'flashcards' || normalizedSectionId === 'summary'
      ? await getChapterFlashcards(chapter.slug)
      : null;
  const chapterQuizDeck =
    normalizedSectionId === 'quiz' || normalizedSectionId === 'summary'
      ? await getChapterQuizDeck(chapter.slug)
      : null;
  const nextChapter = chapters.find((candidate) => candidate.number === chapter.number + 1) ?? null;

  return (
    <div className="stack-xl">
      <section className="hero hero--chapter">
        <p className="eyebrow">Chapter workspace</p>
        <h2>{chapter.fullTitle}</h2>
        <p className="hero__copy">{chapter.description}</p>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Section navigation</p>
            <h3>Open another chapter step</h3>
          </div>
        </div>
        <div className="route-chip-row">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={`/chapters/${chapter.slug}/${step.id}`}
              className={`route-chip ${step.id === section.id ? 'route-chip--active' : ''}`}
            >
              {step.label}
            </Link>
          ))}
        </div>
      </section>

      {normalizedSectionId === 'topics' && chapterTopics ? (
        <ChapterTopicsViewer
          chapterSlug={chapter.slug}
          chapterTitle={
            section.id === 'terminology' ? `${chapter.fullTitle} - Terminology` : chapter.fullTitle
          }
          topics={chapterTopics}
        />
      ) : null}

      {normalizedSectionId === 'scenarios' && chapterScenarios ? (
        <ChapterScenariosViewer
          chapterSlug={chapter.slug}
          chapterTitle={chapter.fullTitle}
          scenarios={chapterScenarios}
        />
      ) : null}

      {normalizedSectionId === 'labs' && chapterLabDefinition ? (
        <ChapterLabsWorkspace
          chapterSlug={chapter.slug}
          chapterTitle={chapter.fullTitle}
          labDefinition={chapterLabDefinition}
        />
      ) : null}

      {normalizedSectionId === 'flashcards' && chapterFlashcards ? (
        <ChapterFlashcardsViewer
          chapterSlug={chapter.slug}
          chapterTitle={
            section.id === 'acronyms'
              ? `${chapter.fullTitle} - Acronym Flashcards`
              : chapter.fullTitle
          }
          flashcards={chapterFlashcards}
        />
      ) : null}

      {normalizedSectionId === 'quiz' && chapterQuizDeck ? (
        <ChapterQuizPlayer
          chapterSlug={chapter.slug}
          chapterTitle={
            section.id === 'practice-quiz'
              ? `${chapter.fullTitle} - Practice Quiz`
              : chapter.fullTitle
          }
          questions={chapterQuizDeck}
        />
      ) : null}

      {normalizedSectionId === 'summary' && chapterTopics && chapterFlashcards && chapterQuizDeck ? (
        <ChapterSummaryPanel
          chapterSlug={chapter.slug}
          chapterTitle={chapter.fullTitle}
          topicCount={chapterTopics.length}
          scenarioCount={chapterScenarios?.length ?? 0}
          labCount={chapterLabDefinition?.activities.length ?? 0}
          flashcardCount={chapterFlashcards.length}
          quizCount={chapterQuizDeck.length}
          nextChapterSlug={nextChapter?.slug ?? null}
        />
      ) : null}

      {![
        'topics',
        'scenarios',
        'labs',
        'flashcards',
        'quiz',
        'summary',
        'acronyms',
        'terminology',
        'practice-quiz',
      ].includes(section.id) ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Current section</p>
              <h3>{section.label}</h3>
          </div>
        </div>
        <p className="panel__copy">{section.description}</p>
        <p className="panel__copy">
          This section is wired into the shared chapter content model and can be reused across the
          broader study workspace.
        </p>
      </section>
      ) : null}
    </div>
  );
}
